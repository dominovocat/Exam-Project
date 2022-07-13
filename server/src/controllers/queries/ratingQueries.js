const bd = require("../../models");
const ServerError = require("../../errors/ServerError");

const updateRating = async (data, predicate, transaction) => {
  const [updatedCount, [updatedRating]] = await bd.Rating.update(data, {
    where: predicate,
    returning: true,
    transaction,
  });
  if (updatedCount !== 1) {
    throw new ServerError("cannot update mark on this offer");
  }
  return updatedRating.dataValues;
};
module.exports.updateRating = updateRating;

const createRating = async (data, transaction) => {
  const result = await bd.Rating.create(data, { transaction });
  if (!result) {
    throw new ServerError("cannot mark offer");
  } else {
    return result.get({ plain: true });
  }
};
module.exports.createRating = createRating;

module.exports.getMarkQuery = (offerId, userId, mark, isFirst, transaction) => {
  const getCreateQuery = () =>
    createRating(
      {
        offerId,
        mark,
        userId,
      },
      transaction
    );
  const getUpdateQuery = () =>
    updateRating({ mark }, { offerId, userId }, transaction);
  return isFirst ? getCreateQuery : getUpdateQuery;
};
