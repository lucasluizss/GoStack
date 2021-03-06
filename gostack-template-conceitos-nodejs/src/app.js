const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const validateUUID = (request, response, next) => {
  const { id } = request.params;

  if (isUuid(id)) {
    return next();
  }

  return response.status(400).json({ message: 'Id inválido!' });
};

const validateRepositoryExists = (request, response, next) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(r => r.id === id);

  if (repositoryIndex > -1) {
    request.repositoryIndex = repositoryIndex;
    return next();
  }

  return response.status(404).json({ message: `Repositório com id: ${id} não encontrado!` })
};

app.use("/repositories/:id", validateUUID, validateRepositoryExists);

const repositories = [];

app.get("/repositories", (request, response) => {
  return response.status(200).json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = repositories[request.repositoryIndex];

  repository.title = title;
  repository.url = url;
  repository.techs = techs;

  return response.status(200).json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  repositories.splice(request.repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const repository = repositories[request.repositoryIndex];

  repository.likes++;

  return response.status(200).json(repository)
});

module.exports = app;
