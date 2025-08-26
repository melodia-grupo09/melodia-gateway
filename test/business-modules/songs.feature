Feature: Song Management

  Scenario: Successfully create a song
    When the user creates a song with title "Bohemian Rhapsody" and artist "Queen"
    Then the response status code is 201
    And the response body contains the created song with the title "Bohemian Rhapsody"

  Scenario: Retrieve the list of songs
    Given a song with title "Stairway to Heaven" and artist "Led Zeppelin"
    And a song with title "Hotel California" and artist "Eagles"
    When the user requests the list of songs
    Then the response status code is 200
    And the list of songs contains the song "Stairway to Heaven"
    And the list of songs contains the song "Hotel California"

  Scenario: Retrieve a song by its ID
    Given a song with title "Stairway to Heaven" and artist "Led Zeppelin"
    When the user requests the song with title "Stairway to Heaven" by its ID
    Then the response status code is 200
    And the details of the received song are correct for the song "Stairway to Heaven"

  Scenario: Update an existing song
    Given a song with title "Like a Rolling Stone" and artist "Bob Dylan"
    When the user updates the song with title "Like a Rolling Stone" to the new title "Like a Complete Unknown" and new artist "Bob Dylan"
    Then the response status code is 200
    And the song details for "Like a Rolling Stone" have been updated to "Like a Complete Unknown" and "Bob Dylan"

  Scenario: Delete a song
    Given a song with title "Smells Like Teen Spirit" and artist "Nirvana"
    When the user deletes the song with title "Smells Like Teen Spirit" by its ID
    Then the response status code is 204
    And the song "Smells Like Teen Spirit" no longer exists in the list of songs

  # Unhappy path scenarios
  Scenario: Attempt to retrieve a non-existent song
    When the user requests a song with ID "00000000-0000-0000-0000-000000000000"
    Then the response status code is 404

  Scenario: Attempt to update a non-existent song
    When the user tries to update a song with ID "00000000-0000-0000-0000-000000000000"
    Then the response status code is 404

  Scenario: Attempt to delete a non-existent song
    When the user tries to delete a song with ID "00000000-0000-0000-0000-000000000000"
    Then the response status code is 404