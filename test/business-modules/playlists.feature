Feature: Playlists Management

  Scenario: Successfully create a playlist
    When the user creates a playlist with name "My Rock Classics" and description "Your essential collection of legendary rock tracks that truly never get old."
    Then the response status code is 201
    And the response body contains the created playlist with the name "My Rock Classics"

  Scenario: Retrieve the list of playlists
    Given a playlist with name "Pop Hits" and description "The ultimate playlist featuring today's biggest chart-topping pop artists."
    Given the user has published the playlist with name "Pop Hits"
    When the user requests the list of playlists
    Then the response status code is 200
    And the list of playlists contains the playlist "Pop Hits"

  Scenario: Retrieve a playlist by its ID
    Given a playlist with name "Chill Lo-Fi" and description "Unwind, study, or simply relax with these smooth and atmospheric lo-fi beats."
    When the user requests the playlist with name "Chill Lo-Fi" by its ID
    Then the response status code is 200
    And the details of the received playlist are correct

  Scenario: Delete a playlist
    Given a playlist with name "To Be Deleted" and description "A temporary collection of sounds and forgotten songs. Listen at your own risk."
    When the user deletes the playlist with name "To Be Deleted" by its ID
    Then the response status code is 204
    And the playlist "To Be Deleted" no longer exists in the list of playlists

  Scenario: Add a song to a playlist
    Given a song with title "Smells Like Teen Spirit" and artist "Nirvana"
    And a playlist with name "Rock Anthems" and description "Turn up the volume for these powerful and iconic rock anthems to sing out loud."
    When the user adds by ID the song with name "Smells Like Teen Spirit" to the playlist with name "Rock Anthems"
    Then the response status code is 200
    And the playlist "Rock Anthems" contains the song "Smells Like Teen Spirit"

  Scenario: A playlist is not published by default after creation
    When the user creates a playlist with name "Unpublished Playlist" and description "This is a playlist to test the app's features. It contains a random mix of songs from different genres."
    Then the response status code is 201
    And the response body contains the created playlist with the name "Unpublished Playlist"
    And the playlist "Unpublished Playlist" is not published

  Scenario: Publish a playlist
    Given a playlist with name "My Rock Classics" and description "Your essential collection of legendary rock tracks that truly never get old."
    When the user publishes the playlist with name "My Rock Classics"
    Then the response status code is 200
    And the playlist "My Rock Classics" is published

  # Unhappy path scenarios
  Scenario: Attempt to retrieve a non-existent playlist
    When the user requests a playlist with ID "00000000-0000-0000-0000-000000000000"
    Then the response status code is 404

  Scenario: Attempt to delete a non-existent playlist
    When the user tries to delete a playlist with ID "00000000-0000-0000-0000-000000000000"
    Then the response status code is 404

  Scenario: Attempt to add a non-existent song to a playlist
    Given a playlist with name "Test Playlist" and description "This is a playlist to test the app's features. It contains a random mix of songs from different genres."
    When the user adds the song with id "00000000-0000-0000-0000-000000000000" to the playlist with name "Test Playlist"
    Then the response status code is 404

  Scenario: Attempt to add a song to a non-existent playlist
    Given a song with title "Test Song" and artist "Test Artist"
    When the user adds the song with name "Test Song" to the playlist with ID "00000000-0000-0000-0000-000000000000"
    Then the response status code is 404

  Scenario: Attempt to create a playlist with a long description
    When the user creates a playlist with name "Long Description Playlist" and description "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    Then the response status code is 400

  Scenario: Attempt to create a playlist with a short description
    When the user creates a playlist with name "Short Description Playlist" and description "Too short to be valid"
    Then the response status code is 400