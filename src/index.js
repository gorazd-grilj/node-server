import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

const port = process.env.PORT || 5000;
const mongoPort = process.env.MPORT || 27017;
const mongoDB = process.env.MBD || "licila";
const DB_URI = `mongodb://mongodb:${mongoPort}/${mongoDB}`; // docker
// const DB_URI = `mongodb://localhost:${mongoPort}/${mongoDB}`;

// mongo schema
const todoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  task_name: { type: String, required: true },
  description: { type: String, required: true },
  date_from: { type: Date, required: true, default: Date.now },
  date_to: { type: Date, default: "" },
});

const ToDo = mongoose.model("ToDo", todoSchema);

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,PUT,POST,DELETE",
  })
);
server.use(express.json());

const route = express.Router();

// MIDDLEWARE
server.use("/", async (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

server.use("/", route);

route.get("/", (_req, res) => {
  res.status(200).send({ message: `Node server is up and running. ${new Date().toISOString()}` });
});

route.post("/add", async (req, res) => {
  let result = await ToDo.create({
    name: req.body.user,
    task_name: req.body.task_name,
    description: req.body.description,
    date_from: req.body.date_from,
    date_to: req.body.date_to,
  });
  res.status(201).send(result);
});

route.post("/list", async (req, res) => {
  const result = await ToDo.find()
    .skip(req.body.skip)
    .limit(req.body.limit)
    .sort({ date_from: -1 });
  res.status(200).send(result);
});

route.post("/find", async (req, res) => {
  const result = await ToDo.find({
    $or: [
      { name: { $regex: req.body.find_todo } },
      { task_name: { $regex: req.body.find_todo } },
      { description: { $regex: req.body.find_todo } },
    ],
  });
  await res.status(200).send(result);
});

route.post("/id", async (req, res) => {
  const result = await ToDo.findOne({ _id: req.body.list_todo });
  res.status(200).send(result);
});

route.put("/update", async (req, res) => {
  const result = await ToDo.updateOne(
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

route.delete("/delete", async (req, res) => {
  const result = await ToDo.deleteOne({ _id: req.body._id });
  res.status(200).send(result);
});

// connect to database
mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

server.listen(port, () => {
  console.log(`Node server is listening on ${port}`);
});
