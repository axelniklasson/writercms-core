# WriterCMS Core
![WriterCMS logo](https://storage.googleapis.com/writer-images/logo.png)

[![Build Status](https://travis-ci.org/WriterCMS/writercms-core.svg?branch=feature%2Ftests)](https://travis-ci.org/WriterCMS/writercms-core)
[![GitHub issues](https://img.shields.io/github/issues/WriterCMS/writercms-core.svg)](https://github.com/WriterCMS/writercms-core/issues)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

Clean, extremely simple writing tool for developers.

## Purpose
After scouting the web, I could not find a blogging tool as simple as I was searching for. Most of the tools contain lots of - for me - unnecessary features, which inspired me to write my own tool. Hence, Writer was born. The idea of Writer is to be able to write blog posts fast and easy, while at the same time making sure that the website loads fast and is as optimized as possible.

## Demo
I am currently developing Writer during my spare time, and my pre-alpha version of Writer is integrated into [resa.axelniklasson.se](http://resa.axelniklasson.se), where I am currently testing everything and writing some random posts. When Writer is considered more or less completed, the source code along with a demo theme will be released and the specific parts related to my personal web hosting and setup and so on will be removed from this repository.

## Goal
Writer is intended to be used by me and my friend while backpacking in South-East Asia in 2017. We're going away for six months and I thought it would be awesome to document our trip using a blog. It will therefore probably be heavily customized for personal use for now, but as previously mentioned it will be updated for open-source use when it is done.

# Features
- [x] Markdown support. Writing posts in Markdown is awesome.
- [x] Attaching images to posts, which are displayed inline after each post.
- [x] Categories, to group posts.
- [x] Share specific posts to FB, Twitter and G+ while implementing Open Graph Protocol to enable Rich Sharing.
- [x] Designed according to Material Design.
- [x] Making it possible for readers to comment on posts.
- [x] Google Analytics integration for administrators.
- [x] Fully responsive - all types of devices should be supported.
- [x] Travis CI integration for making sure builds and tests are always passing.
- [ ] Test suite to cover all API endpoints.

## Project structure

# API
The api resides in the `api/` folder, which is a Node.js server serving an API, using Express and Mongoose.

# Public
`public/` contains a sample frontend, written in Angular which is completely decoupled from the api. When the project is done, this will be replaced by a sample blog theme.

# Timeline
As long as it is completed and deployed prior to our trip. No need to rush it.

# Contributing
Contributions are always greatly appreciated, but since I am currently developing writer integrated with my travel blog, I doubt anyone will find it useful at this time. However, PRs and issues are always welcome!

## Contributors
[Rasmus Jönsson](https://rasmusj.se) - automatic deletion of post images stored on Google Cloud Storage upon post removal.
