import { Given, When, Then, Before } from "@cucumber/cucumber";
import assert from "assert";
import request from "supertest";

Before(function () {
  this.createdSong = null;
  this.response = null;
});

Given('a song exists with name {string} and artist {string}', async function (name: string, artist: string) {
  const res = await request(this.app.getHttpServer())
    .post("/songs")
    .send({ name, artist });
  assert.strictEqual(res.status, 201, 'The precondition song could not be created');
  this.createdSong = res.body.data;
});

When('the user creates a song with name {string} and artist {string}', async function (name: string, artist: string) {
  this.response = await request(this.app.getHttpServer())
    .post("/songs")
    .send({ name, artist });
  if (this.response.body.data) {
    this.createdSong = this.response.body.data;
  }
});

When('the user requests the list of songs', async function () {
  this.response = await request(this.app.getHttpServer()).get("/songs");
});

When('the user requests the song by its ID', async function () {
  assert.ok(this.createdSong?.id, 'No created song ID to request');
  this.response = await request(this.app.getHttpServer()).get(`/songs/${this.createdSong.id}`);
});

When('the user updates the song with the new name {string} and the new artist {string}', async function (newName: string, newArtist: string) {
  assert.ok(this.createdSong?.id, 'No created song ID to update');
  this.response = await request(this.app.getHttpServer())
    .put(`/songs/${this.createdSong.id}`)
    .send({ name: newName, artist: newArtist });
});

When('the user deletes the song by its ID', async function () {
  assert.ok(this.createdSong?.id, 'No created song ID to delete');
  this.response = await request(this.app.getHttpServer()).delete(`/songs/${this.createdSong.id}`);
});

When('the user requests a song with ID {string}', async function (songId: string) {
  this.response = await request(this.app.getHttpServer()).get(`/songs/${songId}`);
});

When('the user tries to update a song with ID {string}', async function (songId: string) {
  this.response = await request(this.app.getHttpServer())
    .put(`/songs/${songId}`)
    .send({ name: 'any name', artist: 'any artist' });
});

When('the user tries to delete a song with ID {string}', async function (songId: string) {
  this.response = await request(this.app.getHttpServer()).delete(`/songs/${songId}`);
});

Then('the response status code is {int}', function (statusCode: number) {
  assert.strictEqual(this.response.status, statusCode, `Expected status code ${statusCode} but got ${this.response.status}`);
});

Then('the response body contains the created song with the name {string}', function (expectedName: string) {
  assert.ok(this.createdSong, 'No song was found in the response');
  assert.strictEqual(this.createdSong.name, expectedName);
  assert.ok(this.createdSong.id, 'The song in the response does not have an ID');
});

Then('the list of songs contains the song {string}', function (songName: string) {
  const songList = this.response.body.data;
  const songExists = songList.some((song: any) => song.name === songName);
  assert.ok(songExists, `The song "${songName}" was not found in the list`);
});

Then('the details of the received song are correct', function () {
  const fetchedSong = this.response.body.data;
  assert.deepStrictEqual(fetchedSong, this.createdSong, 'The song details do not match');
});

Then('the song details have been updated to {string} and {string}', function (expectedName: string, expectedArtist: string) {
  const updatedSong = this.response.body.data;
  assert.strictEqual(updatedSong.name, expectedName, 'The song name was not updated correctly');
  assert.strictEqual(updatedSong.artist, expectedArtist, 'The song artist was not updated correctly');
});

Then('the song no longer exists in the list of songs', async function () {
  const getResponse = await request(this.app.getHttpServer()).get("/songs");
  const songList = getResponse.body.data;
  const songExists = songList.some((song: any) => song.id === this.createdSong.id);
  assert.strictEqual(songExists, false, `The deleted song "${this.createdSong.name}" was unexpectedly found in the list`);
});