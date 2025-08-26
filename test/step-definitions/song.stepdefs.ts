import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import request from 'supertest';
import { TestWorld } from './common.stepdefs'; // ✨ Importa el World
import { SongDTO } from 'src/business-modules/song-manager/dtos/song.dto';

// --- Givens ---
Given(
  'a song with title {string} and artist {string}',
  async function (this: TestWorld, title: string, artist: string) {
    const res = await request(this.app.getHttpServer())
      .post('/songs')
      .send({ title, artist });
    assert.strictEqual(
      res.status,
      201,
      `The precondition song "${title}" could not be created`,
    );
    this.songs.set(title, (res.body as { data: SongDTO }).data);
  },
);

// --- Whens ---
When(
  'the user creates a song with title {string} and artist {string}',
  async function (this: TestWorld, title: string, artist: string) {
    this.response = await request(this.app.getHttpServer())
      .post('/songs')
      .send({ title, artist });

    if (!this.response || !this.response.body) {
      throw new Error('Song creation failed');
    }
    this.songs.set(title, (this.response.body as { data: SongDTO }).data);
  },
);

When('the user requests the list of songs', async function (this: TestWorld) {
  this.response = await request(this.app.getHttpServer()).get('/songs');
});

When(
  'the user requests the song with title {string} by its ID',
  async function (this: TestWorld, title: string) {
    const song = this.songs.get(title);
    assert.ok(
      song?.id,
      `Test setup error: Song "${title}" not found in the test context.`,
    );
    this.response = await request(this.app.getHttpServer()).get(
      `/songs/${song.id}`,
    );
  },
);

When(
  'the user updates the song with title {string} to the new title {string} and new artist {string}',
  async function (
    this: TestWorld,
    oldTitle: string,
    newTitle: string,
    newArtist: string,
  ) {
    const song = this.songs.get(oldTitle);
    assert.ok(
      song?.id,
      `Test setup error: Song "${oldTitle}" not found in the test context.`,
    );
    this.response = await request(this.app.getHttpServer())
      .put(`/songs/${song.id}`)
      .send({ title: newTitle, artist: newArtist });
  },
);

When(
  'the user deletes the song with title {string} by its ID',
  async function (this: TestWorld, title: string) {
    const song = this.songs.get(title);
    assert.ok(
      song?.id,
      `Test setup error: Song "${title}" not found in the test context.`,
    );
    this.response = await request(this.app.getHttpServer()).delete(
      `/songs/${song.id}`,
    );
  },
);

When(
  'the user requests a song with ID {string}',
  async function (this: TestWorld, songId: string) {
    this.response = await request(this.app.getHttpServer()).get(
      `/songs/${songId}`,
    );
  },
);

When(
  'the user tries to update a song with ID {string}',
  async function (this: TestWorld, songId: string) {
    this.response = await request(this.app.getHttpServer())
      .put(`/songs/${songId}`)
      .send({ title: 'any title', artist: 'any artist' });
  },
);

When(
  'the user tries to delete a song with ID {string}',
  async function (this: TestWorld, songId: string) {
    this.response = await request(this.app.getHttpServer()).delete(
      `/songs/${songId}`,
    );
  },
);

// --- Thens ---
Then(
  'the response body contains the created song with the title {string}',
  function (this: TestWorld, name: string) {
    if (!this.response) {
      throw new Error('Response is not defined');
    }
    const createdSong = (this.response.body as { data: SongDTO }).data;
    assert.ok(createdSong, 'Response body did not contain a song object');
    assert.strictEqual(createdSong.title, name);
    assert.ok(createdSong.id, 'The created song does not have an ID');
  },
);

Then(
  'the list of songs contains the song {string}',
  function (this: TestWorld, songName: string) {
    if (!this.response) {
      throw new Error('Response is not defined');
    }
    const songList = (this.response.body as { data: SongDTO[] }).data;
    const songExists = songList.some((song) => song.title === songName);
    assert.ok(songExists, `The song "${songName}" was not found in the list`);
  },
);

Then(
  'the details of the received song are correct for the song {string}',
  function (this: TestWorld, name: string) {
    const songFromContext = this.songs.get(name);
    if (!this.response) {
      throw new Error('Response is not defined');
    }
    const songFromResponse = (this.response.body as { data: SongDTO }).data;
    assert.ok(
      songFromContext,
      `Test setup error: Song "${name}" not found in context to compare.`,
    );
    assert.deepStrictEqual(
      songFromResponse,
      songFromContext,
      'The song details do not match',
    );
  },
);

Then(
  'the song details for {string} have been updated to {string} and {string}',
  async function (
    this: TestWorld,
    oldName: string,
    newName: string,
    newArtist: string,
  ) {
    const originalSong = this.songs.get(oldName);
    assert.ok(
      originalSong,
      `Test setup error: Original song "${oldName}" not found in context.`,
    );

    if (!this.response) {
      throw new Error('Response is not defined');
    }
    const updatedSongResponse = (this.response.body as { data: SongDTO }).data;
    assert.strictEqual(
      updatedSongResponse.title,
      newName,
      'The song name was not updated correctly in the response',
    );
    assert.strictEqual(
      updatedSongResponse.artist,
      newArtist,
      'The song artist was not updated correctly in the response',
    );

    const getResponse = await request(this.app.getHttpServer()).get(
      `/songs/${originalSong.id}`,
    );
    const persistedSong = (getResponse.body as { data: SongDTO }).data;
    assert.strictEqual(
      persistedSong.title,
      newName,
      'The song name was not persisted correctly',
    );
  },
);

Then(
  'the song {string} no longer exists in the list of songs',
  async function (this: TestWorld, name: string) {
    const deletedSong = this.songs.get(name);
    assert.ok(
      deletedSong,
      `Test setup error: Song "${name}" not found in context.`,
    );

    const getResponse = await request(this.app.getHttpServer()).get('/songs');
    const songList = (getResponse.body as { data: SongDTO[] }).data;
    const songExists = songList.some((song) => song.id === deletedSong.id);
    assert.strictEqual(
      songExists,
      false,
      `The deleted song "${name}" was unexpectedly found in the list`,
    );
  },
);
