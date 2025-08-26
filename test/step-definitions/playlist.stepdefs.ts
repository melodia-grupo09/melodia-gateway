import { Given, When, Then } from "@cucumber/cucumber";
import assert from "assert";
import request from "supertest";
import { TestWorld } from "./common.stepdefs";
import { PlaylistDTO } from "src/business-modules/playlist-manager/dtos/playlist.dto";

// --- Givens (Preconditions) ---
Given('a playlist with name {string} and description {string}', async function (this: TestWorld, name: string, description: string) {
  const res = await request(this.app.getHttpServer())
    .post("/playlists")
    .send({ name, description });
  assert.strictEqual(res.status, 201, `The precondition playlist "${name}" could not be created`);

  const createdPlaylist = res.body.data;
  this.createdPlaylist = createdPlaylist;
  this.playlists.set(name, createdPlaylist);
});


// --- Whens (Actions) ---
When('the user creates a playlist with name {string} and description {string}', async function (this: TestWorld, name: string, description: string) {
  this.response = await request(this.app.getHttpServer())
    .post("/playlists")
    .send({ name, description });

    if (!this.response.body.data) {
      throw new Error('Playlist creation failed');
    }
    const createdPlaylist = this.response.body.data;
    this.createdPlaylist = createdPlaylist;
    this.playlists.set(name, createdPlaylist);
});

When('the user requests the list of playlists', async function (this: TestWorld) {
  this.response = await request(this.app.getHttpServer()).get("/playlists");
});

When('the user requests the playlist with name {string} by its ID', async function (this: TestWorld, name: string) {
  const playlist = this.playlists.get(name);
  assert.ok(playlist?.id, `Could not find a created playlist named "${name}" in the test context`);
  this.response = await request(this.app.getHttpServer()).get(`/playlists/${playlist.id}`);
});

When('the user requests a playlist with ID {string}', async function (this: TestWorld, playlistId: string) {
  this.response = await request(this.app.getHttpServer()).get(`/playlists/${playlistId}`);
});

When('the user deletes the playlist with name {string} by its ID', async function (this: TestWorld, name: string) {
  const playlist = this.playlists.get(name);
  assert.ok(playlist?.id, `Could not find a created playlist named "${name}" to delete`);
  this.response = await request(this.app.getHttpServer()).delete(`/playlists/${playlist.id}`);
});

When('the user tries to delete a playlist with ID {string}', async function (this: TestWorld, playlistId: string) {
  this.response = await request(this.app.getHttpServer()).delete(`/playlists/${playlistId}`);
});

When('the user adds by ID the song with name {string} to the playlist with name {string}', async function (this: TestWorld, songName: string, playlistName: string) {
  const playlist = this.playlists.get(playlistName);
  const song = this.songs.get(songName);
  
  assert.ok(playlist?.id, `Precondition failed: Playlist "${playlistName}" not found in test context.`);
  assert.ok(song?.id, `Precondition failed: Song "${songName}" not found in test context.`);

  this.response = await request(this.app.getHttpServer())
    .post(`/playlists/${playlist.id}/songs`)
    .send({ songId: song.id });
});

When('the user adds the song with id {string} to the playlist with name {string}', async function (this: TestWorld, songId: string, playlistName: string) {
  const playlist = this.playlists.get(playlistName);
  assert.ok(playlist?.id, `Precondition failed: Playlist "${playlistName}" not found in test context.`);

  this.response = await request(this.app.getHttpServer())
    .post(`/playlists/${playlist.id}/songs`)
    .send({ songId });
});

When('the user adds the song with name {string} to the playlist with ID {string}', async function (this: TestWorld, songName: string, playlistId: string) {
  const song = this.songs.get(songName);
  assert.ok(song?.id, `Precondition failed: Song "${songName}" not found in test context.`);

  this.response = await request(this.app.getHttpServer())
    .post(`/playlists/${playlistId}/songs`)
    .send({ songId: song.id });
});


// --- Thens (Assertions) ---
Then('the response body contains the created playlist with the name {string}', function (this: TestWorld, expectedName: string) {
  if (!this.response) {
    throw new Error('Response is undefined');
  }
  assert.ok(this.response.body.data, 'The response body does not contain data');
  const createdPlaylist = this.response.body.data as PlaylistDTO;
  
  assert.strictEqual(createdPlaylist.name, expectedName, 'The playlist name in the response is incorrect');
  assert.ok(createdPlaylist.id, 'The playlist in the response does not have an ID');
});

Then('the list of playlists contains the playlist {string}', function (this: TestWorld, playlistName: string) {
  if (!this.response) {
    throw new Error('Response is undefined');
  }
  assert.ok(this.response.body.data && Array.isArray(this.response.body.data), 'The response data is not an array');
  const playlists = this.response.body.data as PlaylistDTO[];
  const playlistExists = playlists.some(p => p.name === playlistName);
  assert.ok(playlistExists, `The playlist "${playlistName}" was not found in the list`);
});

Then('the details of the received playlist are correct', function (this: TestWorld) {
  if (!this.response) {
    throw new Error('Response is undefined');
  }
  assert.ok(this.response.body.data, 'The response body does not contain data');
  const fetchedPlaylist = this.response.body.data as PlaylistDTO;
  
  assert.deepStrictEqual(fetchedPlaylist, this.createdPlaylist, 'The playlist details do not match the created one');
});

Then('the playlist {string} no longer exists in the list of playlists', async function (this: TestWorld, playlistName: string) {
  const deletedPlaylist = this.playlists.get(playlistName);
  assert.ok(deletedPlaylist, `Could not find playlist "${playlistName}" in the test context to verify deletion`);
  
  const getResponse = await request(this.app.getHttpServer()).get("/playlists");
  const currentPlaylists = getResponse.body.data as PlaylistDTO[];
  const playlistExists = currentPlaylists.some(p => p.id === deletedPlaylist.id);

  assert.strictEqual(playlistExists, false, `The deleted playlist "${playlistName}" was unexpectedly found in the list`);
});

Then('the playlist {string} contains the song {string}', function (this: TestWorld, playlistName: string, songName: string) {
  if (!this.response) {
    throw new Error('Response is undefined');
  }
  const playlistData = this.response.body.data;
  assert.ok(playlistData && playlistData.songs, "Response data is empty or does not contain a 'songs' property");
  
  const songExists = playlistData.songs.some((s: any) => s.name === songName);
  assert.ok(songExists, `The song "${songName}" was not found in the playlist "${playlistName}"`);

  const songLink = playlistData.songs.find((s: any) => s.name === songName);
  assert.ok(songLink.addedAt, 'The song in the playlist does not have an "addedAt" property');
});