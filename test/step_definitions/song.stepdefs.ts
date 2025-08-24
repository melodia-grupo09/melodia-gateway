import { Given, When, Then } from "@cucumber/cucumber";
import assert from "assert";
import request from "supertest";

Given("a song with name {string} and artist {string}", async function (name: string, artist: string) {
  const createdSong = await request(this.app.getHttpServer())
    .post("/songs")
    .send({ name, artist })
    .expect(201);
  this.createdSong = createdSong.body.data;
});

When('someone creates a song with name {string} and artist {string}', async function (name: string, artist: string) {
  const response = await request(this.app.getHttpServer())
    .post("/songs")
    .send({ name, artist })
    .expect(201);
  this.createdSong = response.body.data;
});

When('someone retrieves the songs', async function () {
  const response = await request(this.app.getHttpServer())
    .get("/songs")
    .expect(200);
  this.retrievedSongs = response.body.data;
});

Then('the song with name {string} is successfully created and available', async function (name: string) {
  assert.equal(this.createdSong.name, name);
  assert.equal(typeof this.createdSong.id, 'string');
  const response = await request(this.app.getHttpServer())
    .get('/songs')
    .expect(200);
  this.fetchedSong = response.body.data.find((song: any) => song.id === this.createdSong.id);
});

Then('the song with name {string} should be in the retrieved songs', function (name: string) {
  const songExists = this.retrievedSongs.some((song: any) => song.name === name);
  if (!songExists) {
    throw new Error(`Song with name "${name}" not found in the retrieved songs`);
  }
});
