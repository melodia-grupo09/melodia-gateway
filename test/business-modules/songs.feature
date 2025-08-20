Feature: Songs
  Scenario: Create a Song
    When someone creates a song with name "Song Title" and artist "Artist Name"
    Then the song should be created and retrievable

  Scenario: Retrieve Songs
    Given a song with name "Song Title" and artist "Artist Name"
    When someone retrieves the songs
    Then the song with name "Song Title" should be in the retrieved songs