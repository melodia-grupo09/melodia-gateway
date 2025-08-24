Feature: Song Management

  Scenario: Successfully create a song
    When the user creates a song with name "Test Song" and artist "Test Artist"
    Then the response status code is 201
    And the response body contains the created song with the name "Test Song"

  Scenario: Retrieve the list of songs
    Given a song exists with name "Test Song" and artist "Test Artist"
    When the user requests the list of songs
    Then the response status code is 200
    And the list of songs contains the song "Test Song"

  Scenario: Retrieve a song by its ID
    Given a song exists with name "Stairway to Heaven" and artist "Led Zeppelin"
    When the user requests the song by its ID
    Then the response status code is 200
    And the details of the received song are correct

  Scenario: Update an existing song
    Given a song exists with name "Old Song" and artist "Old Artist"
    When the user updates the song with the new name "Updated Song" and the new artist "Updated Artist"
    Then the response status code is 200
    And the song details have been updated to "Updated Song" and "Updated Artist"

  Scenario: Delete a song
    Given a song exists with name "Test Song" and artist "Test Artist"
    When the user deletes the song by its ID
    Then the response status code is 204
    And the song no longer exists in the list of songs

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