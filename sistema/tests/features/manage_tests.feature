Feature: Manage Tests
  As a professor
  I want to create, modify, and remove tests using existing questions
  So that I can assign them to my students

  Scenario: Create a test with letters identifying alternatives
    Given there is a question "Which planet is known as the Red Planet?" in the database
    When I create a test titled "Science Exam" with the question "Which planet is known as the Red Planet?" using "letters" style
    Then the system should have a test titled "Science Exam" with 1 question
    And the question in the test should be configured to use "letters" style

  Scenario: Modify an existing test
    Given there is a question "Which planet is known as the Red Planet?" in the database
    And there is a test titled "Science Exam" using that question with "letters" style
    When I modify the test "Science Exam" to use the question with "powersOf2" style
    Then the test "Science Exam" should be configured to use "powersOf2" style

  Scenario: Remove a test
    Given there is a test titled "Science Exam"
    When I remove the test "Science Exam"
    Then the system should not have a test titled "Science Exam"
