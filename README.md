# Cognizable

Find the application at https://cognizable.herokuapp.com

## Overview

Cognizable is a front-end Javascript clone of the popular game 'Memory'. Log in (not password protected), select a difficulty, and match upturned cards together. Time taken and turns made are kept track of for the high scores leaderboard.

## Technology

Cognizable uses vanilla Javascript for all functionality. The backend
JSON API is built in Ruby on Rails: https://github.com/buckethead1986/cognizable_api.
The database is Postgres and is responsible for keeping all of the data
pertaining to sessions, users, and cards.

## Functionality

A user logs in, selects a difficulty, and starts playing a game.

When all cards have been matched, the game ends, and total turns are displayed.  If the total turns are less a high score on the leaderboard, it gets updated (one high score per player).

## Layout / Design

I used Bootstrap for all design elements, although this particular application was made more for the underlying algorithms than any 'wow-factor' design.
