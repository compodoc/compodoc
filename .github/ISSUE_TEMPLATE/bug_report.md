---
name: Bug report
about: Create a report to help us improve Compodoc
title: '[BUG] '
labels: [Bug]
assignees:
    - vogloblinsky
body:
    - type: markdown
      attributes:
          value: |
              Thanks for taking the time to fill out this bug report!
    - type: textarea
      id: what-happened
      attributes:
          label: Overview of the issue
          description: explain the issue, if an error is being thrown a stack trace helps
      validations:
          required: true
    - type: textarea
      id: global-informations
      attributes:
          label: Global informations
          description: Operating System, Node.js, npm, Angular, Compodoc version(s)
      validations:
          required: true
    - type: textarea
      id: sourcecode
      attributes:
          label: Sourcecode
          description: If possible sourcecode of the file where it breaks
      validations:
          required: false
    - type: textarea
      id: logs
      attributes:
          label: Terminal logs
          description: If possible your terminal logs before the error
      validations:
          required: false
    - type: textarea
      id: reproduce
      attributes:
          label: Reproduce the error
          description: an unambiguous set of steps to reproduce the error, or link to a github repository
      validations:
          required: false
    - type: textarea
      id: suggest
      attributes:
          label: Suggest a Fix
          description: if you can't fix the bug yourself, perhaps you can point to what might be causing the problem (line of code or commit)
      validations:
          required: false
    - type: markdown
      attributes:
          value: |
              Love compodoc? Please consider supporting our collective : 👉  https://opencollective.com/compodoc/donate
---
