Feature: Test Correction and Reports Generation
  As a teacher
  I want to upload an answer key and student responses in CSV format
  So that the system can automatically grade the tests and generate a report

  Scenario: Rigorous Grading Correction
    Given a CSV with the correct answers
    And a CSV with the student responses
    When I select the rigorous correction method that penalizes wrong choices
    Then the student should receive zero for a question if any wrong choice is selected or if an answer is absent

  Scenario: Proportionate Grading Correction
    Given a CSV with the correct answers
    And a CSV with the student responses
    When I select the proportional correction method
    Then the student should receive a proportional grade based on the percentage of right choices selected
