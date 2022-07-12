const jwt = require("jsonwebtoken");
const CONSTANTS = require("../constants");
const bd = require("../models");
const NotUniqueEmail = require("../errors/NotUniqueEmail");
const moment = require("moment");
const { v4: uuid } = require("uuid");
const controller = require("../socketInit");
const userQueries = require("./queries/userQueries");
const bankQueries = require("./queries/bankQueries");
const ratingQueries = require("./queries/ratingQueries");
const {
  CONTEST_STATUS_PENDING,
  CONTEST_STATUS_ACTIVE,
} = require("../constants");
const { prepareUser } = require("../utils/user.utils");
const { createAccessToken } = require("../services/jwtService");

module.exports.login = async (req, res, next) => {
  try {
    const foundUser = await userQueries.findUser({ email: req.body.email });
    await userQueries.passwordCompare(req.body.password, foundUser.password);
    const accessToken = createAccessToken(foundUser);

    await userQueries.updateUser({ accessToken }, foundUser.id);
    res.send({ user: prepareUser(foundUser), token: accessToken });
  } catch (err) {
    next(err);
  }
};
module.exports.registration = async (req, res, next) => {
  try {
    const newUser = await userQueries.userCreation(req.body);

    const accessToken = createAccessToken(foundUser);

    await userQueries.updateUser({ accessToken }, newUser.id);
    res.send({ user: prepareUser(newUser), token: accessToken });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      next(new NotUniqueEmail());
    } else {
      next(err);
    }
  }
};

module.exports.changeMark = async (req, res, next) => {
  let sum = 0;
  let avg = 0;
  let transaction;
  const { isFirst, offerId, mark, creatorId } = req.body;
  const userId = req.tokenData.userId;
  try {
    transaction = await bd.sequelize.transaction({
      isolationLevel:
        bd.Sequelize.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
    });
    const query = ratingQueries.getMarkQuery(
      offerId,
      userId,
      mark,
      isFirst,
      transaction
    );
    await query();
    const offersArray = await bd.Ratings.findAll({
      include: [
        {
          model: bd.Offers,
          required: true,
          where: { userId: creatorId },
        },
      ],
      transaction,
    });
    for (let i = 0; i < offersArray.length; i++) {
      sum += offersArray[i].dataValues.mark;
    }
    avg = sum / offersArray.length;

    await userQueries.updateUser({ rating: avg }, creatorId, transaction);
    transaction.commit();
    controller.getNotificationController().emitChangeMark(creatorId);
    res.send({ userId: creatorId, rating: avg });
  } catch (err) {
    transaction.rollback();
    next(err);
  }
};

module.exports.payment = async (req, res, next) => {
  let transaction;
  try {
    transaction = await bd.sequelize.transaction();
    await bankQueries.updateBankBalance(
      {
        balance: bd.sequelize.literal(`
                CASE
            WHEN "cardNumber"='${req.body.number.replace(
              / /g,
              ""
            )}' AND "cvc"='${req.body.cvc}' AND "expiry"='${req.body.expiry}'
                THEN "balance"-${req.body.price}
            WHEN "cardNumber"='${CONSTANTS.SQUADHELP_BANK_NUMBER}' AND "cvc"='${
          CONSTANTS.SQUADHELP_BANK_CVC
        }' AND "expiry"='${CONSTANTS.SQUADHELP_BANK_EXPIRY}'
                THEN "balance"+${req.body.price} END
        `),
      },
      {
        cardNumber: {
          [bd.Sequelize.Op.in]: [
            CONSTANTS.SQUADHELP_BANK_NUMBER,
            req.body.number.replace(/ /g, ""),
          ],
        },
      },
      transaction
    );
    const orderId = uuid();
    req.body.contests.forEach((contest, index) => {
      const prize =
        index === req.body.contests.length - 1
          ? Math.ceil(req.body.price / req.body.contests.length)
          : Math.floor(req.body.price / req.body.contests.length);
      contest = Object.assign(contest, {
        status: index === 0 ? CONTEST_STATUS_ACTIVE : CONTEST_STATUS_PENDING,
        userId: req.tokenData.userId,
        priority: index + 1,
        orderId,
        createdAt: moment().format("YYYY-MM-DD HH:mm"),
        prize,
      });
    });
    await bd.Contests.bulkCreate(req.body.contests, transaction);
    transaction.commit();
    res.send();
  } catch (err) {
    transaction.rollback();
    next(err);
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.avatar = req.file.filename;
    }
    const updatedUser = await userQueries.updateUser(
      req.body,
      req.tokenData.userId
    );
    res.send(prepareUser(updatedUser));
  } catch (err) {
    next(err);
  }
};

module.exports.cashout = async (req, res, next) => {
  let transaction;
  try {
    transaction = await bd.sequelize.transaction();
    const updatedUser = await userQueries.updateUser(
      { balance: bd.sequelize.literal("balance - " + req.body.sum) },
      req.tokenData.userId,
      transaction
    );
    await bankQueries.updateBankBalance(
      {
        balance: bd.sequelize.literal(`CASE 
                WHEN "cardNumber"='${req.body.number.replace(
                  / /g,
                  ""
                )}' AND "expiry"='${req.body.expiry}' AND "cvc"='${
          req.body.cvc
        }'
                    THEN "balance"+${req.body.sum}
                WHEN "cardNumber"='${
                  CONSTANTS.SQUADHELP_BANK_NUMBER
                }' AND "expiry"='${
          CONSTANTS.SQUADHELP_BANK_EXPIRY
        }' AND "cvc"='${CONSTANTS.SQUADHELP_BANK_CVC}'
                    THEN "balance"-${req.body.sum}
                 END
                `),
      },
      {
        cardNumber: {
          [bd.Sequelize.Op.in]: [
            CONSTANTS.SQUADHELP_BANK_NUMBER,
            req.body.number.replace(/ /g, ""),
          ],
        },
      },
      transaction
    );
    transaction.commit();
    res.send({ balance: updatedUser.balance });
  } catch (err) {
    transaction.rollback();
    next(err);
  }
};
