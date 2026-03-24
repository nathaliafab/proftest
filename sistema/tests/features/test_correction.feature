Feature: Test Correction and Reports Generation
  As a teacher
  I want to upload an answer key and student responses in CSV format
  So that the system can automatically grade the tests and generate a report

  Scenario: Rigorous Grading Correction
    Given a CSV with the correct answers formatted as:
      """
      Tipo de Prova,q1,q2
      1,"a,b",c
      2,a,"1,2"
      """
    And a CSV with the student responses formatted as:
      """
      Aluno, Tipo de Prova, q1, q2
      Nathalia,1,"a,b",c
      Fulano,1,a,c
      """
    When I select the rigorous correction method that penalizes wrong choices
    Then the report should contain 2 students
    And the student "Nathalia" should have 2 correct answers and a final grade of 2.0
    And the student "Fulano" should have 1 correct answer and a final grade of 1.0

  Scenario: Proportionate Grading Correction
    Given a CSV with the correct answers formatted as:
      """
      Tipo de Prova,q1,q2
      1,"a,b,c",d
      """
    And a CSV with the student responses formatted as:
      """
      Aluno, Tipo de Prova, q1, q2
      Nathalia,1,"a,b",d
      Fulano,1,"a,b,c,x",d
      """
    When I select the proportional correction method
    Then the report should contain 2 students
    And the student "Nathalia" should receive partial credit for question 1
    And the student "Nathalia" should have a final grade of 1.67
    And the student "Fulano" should have a final grade of 2.0

  Scenario: Proportionate Grading with missing answers
    Given a CSV with the correct answers formatted as:
      """
      Tipo de Prova,q1,q2
      1,"a,b,c",d
      """
    And a CSV with the student responses formatted as:
      """
      Aluno, Tipo de Prova, q1, q2
      Ciclano,1,,d
      """
    When I select the proportional correction method
    Then the report should contain 1 students
    And the student "Ciclano" should have a final grade of 1.0

  Scenario: Missing test key in answers CSV
    Given a CSV with the correct answers formatted as:
      """
      Tipo de Prova,q1,q2
      1,a,b
      """
    And a CSV with the student responses formatted as:
      """
      Aluno, Tipo de Prova, q1, q2
      Nathalia,2,a,b
      """
    When I select the rigorous correction method that penalizes wrong choices
    Then the report should indicate an error "Gabarito não encontrado para esta prova" for the student "Nathalia"
    And the student "Nathalia" should have a final grade of 0
