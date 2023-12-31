import Card from "../models/cardModel.js";
//import Board from "../models/boardModel.js";
import Column from "../models/columnModel.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const ERR_NOT_FOUND = (id) => `Column id=${id} not found`;

// ** get all cards
const getAllCards = async (req, res) => {
  const { id } = req.params;const { f } = req.query;
  console.log("getAllCards>>>query", req.query, f, typeof f);

  const { cards } = await Column.findById(id);
  let query = Card.find().where("_id").in(cards);
  if (!!f) {
    query = query.where("priority").equals(f);
  }
  const result = await query.exec(); //Card.find().where('_id').in(cards).where("priority").equals(f).exec();
  res.json(result);
};

// ** get column by id
const getColumnById = async (req, res) => {
	const { id } = req.params;
	const result = await Column.findById(id, "-owner -createdAt -updatedAt -__v");
	if (!result) {
		throw HttpError(404, ERR_NOT_FOUND(id));
	}
	res.json(result);
};

// ** update column
const updateColumn = async (req, res) => {
	const { id } = req.params;
	const result = await Column.findByIdAndUpdate(id, req.body, { new: true }); // =return updated
	if (!result) {
		throw HttpError(404, ERR_NOT_FOUND(id));
	}
	res.json(result);
};

// ** delete column
const deleteById = async (req, res) => {
	const { id } = req.params;
	const result = await Column.findByIdAndDelete(id);
  if (!result) {
    throw HttpError(404, ERR_NOT_FOUND(id));
	}
	const { owner } = result;
	/* const board = await Board.findById(owner);
	if (board.colu mns.length > 0) {
		console.log("board.colum ns.length>>", board.colu mns.length);
		const isColumnId = (item) => item.columnId === id;
		const ind = board.colu mns.findIndex(isColumnId);
		if (ind >= 0) {
			await board.save();
		} else {
			throw HttpError(404, `ERR_DEV: id=${board._id}`);
		}
	} */
	res.json({
		message:
			"Column deleted( FIXME: delete all its cards, and from owner's list)",
	});
};

/**
 * update list of cards // TODO: only for drag-n-drop
 */
const updateCards = async (req, res) => {
	const { id } = req.params;
	const result = await Column.findByIdAndUpdate(id, req.body, { new: true });
	if (!result) {
		throw HttpError(404, ERR_NOT_FOUND(id));
	}
	res.json(result);
};

// ** add card
const addCard = async (req, res) => {
	//console.log("addCard>>>>>>>>>>>>>>>>>>");
	const { id: owner } = req.params;
	const column = await Column.findById(owner);
	if (!column) {
		throw HttpError(404, ERR_NOT_FOUND(owner));
	}

	const result = await Card.create({ ...req.body, owner });
	if (!result) {
		throw HttpError(404, ERR_NOT_FOUND(id));
	}

	//add  to the cards list
	column.cards.push(result);
	await column.save();
	res.status(201).json(result);
};

export default {
  getAllCards: ctrlWrapper(getAllCards), //NEW!
  getColumnById: ctrlWrapper(getColumnById), //NEW!
	updateColumn: ctrlWrapper(updateColumn),
	deleteById: ctrlWrapper(deleteById), //FIXME: delete all from cards list
	updateCards: ctrlWrapper(updateCards), // TODO: only for drag-n-drop
	addCard: ctrlWrapper(addCard),
};
