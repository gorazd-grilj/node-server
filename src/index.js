import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

// mongo schema
const todoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  task_name: { type: String, required: true },
  description: { type: String, required: true },
  date_from: { type: Date, required: true, default: Date.now },
  date_to: { type: Date, default: "" },
});

const todo = mongoose.model("ToDo", todoSchema);

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(
  cors({
    origin: "http://localhost:3000",
    methods: "get,post",
  })
);
server.use(express.json());

const route = express.Router();

// MIDDLEWARE
server.use("/", async (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const port = process.env.PORT || 5000;
const mongo = process.env.MONGO || 27017;

server.use("/", route);

route.get("/", (req, res) => {
  res.status(200).send({ message: "root" });
});

route.post("/add", async (req, res) => {
  let result = await todo({
    name: req.body.user,
    task_name: req.body.task_name,
    description: req.body.description,
    date_from: req.body.date_from,
    date_to: req.body.date_to,
  });
  result.save();
  const cnt = await todo.find().count();
  res
    .status(201)
    .send({ message: `Naloga št: ${cnt} je dodana.`, cnt: cnt });
});

route.post("/list", async (req, res) => {
  const result = await todo
    .find()
    .skip(req.body.skip)
    .limit(req.body.limit)
    .sort({ date_from: -1 });
  res.status(200).send(result);
});

route.post("/find", async (req, res) => {
  const result = await todo.find({
    $or: [
      { name: { $regex: req.body.find_todo } },
      { task_name: { $regex: req.body.find_todo } },
      { description: { $regex: req.body.find_todo } },
    ],
  });
  await res.status(200).send(result);
});

route.post("/id", async (req, res) => {
  const result = await todo.findOne({ _id: req.body.list_todo });
  res.status(200).send(result);
});

route.post("/update", async (req, res) => {
  const result = await todo.updateOne(
    { _id: req.body._id },
    {
      $set: {
        name: req.body.name,
        task_name: req.body.task_name,
        description: req.body.description,
        date_from: req.body.date_from,
        date_to: req.body.date_to,
      },
    }
  );

  res.status(200).send(result);
});

route.post("/delete", async (req, res) => {
  const result = await todo.deleteOne({ _id: req.body._id });
  res.status(200).send(result);
});

// connect to database
mongoose.connect(`mongodb://localhost:${mongo}/licila`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
