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

  Scenario: Generate PDFs with powers of 2 answers
    Given a test exists with title "Advanced Match Test" and style "powersOf2" containing a question "Select even numbers" with answers:
      | description | isCorrect |
      | 2           | true      |
      | 3           | false     |
      | 8           | true      |
    When I request to generate 1 PDFs for the test with header details "Math 202", "Prof. Smith", "2023-11-10"
    Then I should receive a ZIP file containing 1 PDF files
    And the ZIP file should contain a CSV file with the answers

  Scenario: Generate PDFs for a test with multiple questions
    Given a test exists with title "Science Exam" and style "letters" containing a question "What is the capital of France?" with answers:
      | description | isCorrect |
      | Paris       | true      |
      | London      | false     |
    And the test also contains a question "What is H2O?" with answers:
      | description | isCorrect |
      | Water       | true      |
      | Oxygen      | false     |
      | Helium      | false     |
    When I request to generate 3 PDFs for the test with header details "Science 101", "Prof. Curie", "2023-12-01"
    Then I should receive a ZIP file containing 3 PDF files
    And the CSV file should contain multiple question columns
