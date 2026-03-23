Feature: Generate Test PDFs
  As a professor
  I want to generate multiple unique PDFs for a test
  So that I can varied versions of the same test to prevent cheating

  Background:
    Given I have a test repository

  Scenario: Generate PDFs and Answer CSV
    Given a test exists with title "Math Test" and style "letters" containing a question "What is 2+2?" with answers:
      | description | isCorrect |
      | 3           | false     |
      | 4           | true      |
      | 5           | false     |
    When I request to generate 2 PDFs for the test with header details "Math 101", "Prof. Smith", "2023-10-10"
    Then I should receive a ZIP file containing 2 PDF files
    And the ZIP file should contain a CSV file with the answers
