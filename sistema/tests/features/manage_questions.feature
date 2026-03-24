Feature: Manage Multiple Choice Questions
  As a professor
  I want to be able to add, modify, and remove multiple choice questions
  So that I can build tests for my students

  Scenario: Add a new multiple choice question
    Given I have a question bank
    When I add a question with description "What is the capital of France?" and answers:
      | description | isCorrect |
      | Paris       | true      |
      | London      | false     |
    Then the question bank should contain 1 question
    And the first question should have the description "What is the capital of France?"

  Scenario: Modify an existing multiple choice question
    Given I have a question bank with a question "What is the capital of France?"
    When I modify the question "What is the capital of France?" to have description "What is the capital of UK?" and answers:
      | description | isCorrect |
      | London      | true      |
      | Paris       | false     |
    Then the question bank should contain 1 question
    And the first question should have the description "What is the capital of UK?"
    And the first question should have 2 answers

  Scenario: Remove an existing multiple choice question
    Given I have a question bank with a question "What is the capital of France?"
    When I remove the question "What is the capital of France?"
    Then the question bank should contain 0 questions

  Scenario: Add a question with multiple correct answers
    Given I have a question bank
    When I add a question with description "Which of these are programming languages?" and answers:
      | description | isCorrect |
      | Python      | true      |
      | HTML        | false     |
      | Java        | true      |
    Then the question bank should contain 1 question
    And the first question should have the description "Which of these are programming languages?"
    And the first question should have 3 answers
    And 2 of the answers should be marked as correct
