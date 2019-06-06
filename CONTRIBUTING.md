# Contributing

Thank you for running Vidiun and pushing the limits of online video! By joining the Vidiun community and contributing you will help grow the platform, and keeping it open, stable and accessible to all.


## Setup VMC-ng solution
VMC-ng application is built on-top of several Vidiun infrastructures packages which are part of [vidiun-ng](https://github.com/vidiun/vidiun-ng) repository.

### Prerequisites
 - [x] Ensure you have [node.js installed](https://nodejs.org/en/download/current/), version LTS or above.
 - [x] Ensure you have [git installed](https://git-for-windows.github.io/)
 - [x] Ensure you have npm installed, version 5.0.0 or above.

### Getting started
1. git clone [vidiun-ng](https://github.com/vidiun/vidiun-ng) repository 
2. git clone [vmc-ng](https://github.com/vidiun/vmc-ng) repository
3. in `vidiun-ng` local folder run the following:
```
npm install
npm run setup
```
4. in `vmc-ng` local folder run the following:
```
npm install
npm run setup
npm start
```

You should be able to open vmc-ng application in your browser at `http://localhost:4200`.

## <a name="issue"></a> Found an Issue?
If you find a bug in the source code, you can help us by
[submitting an issue](#submit-issue) to our [GitHub Repository][github]. Even better, you can
[submit a Pull Request](#submit-pr) with a fix.

## <a name="submit"></a> Submission Guidelines

### <a name="submit-issue"></a> Submitting an Issue
You can post new issues [here][github-issues].

### <a name="submit-pr"></a> Submitting a Pull Request (PR)
Before you submit your Pull Request (PR) consider the following guidelines:

* Please sign our [Contributor License Agreement (CLA)](#cla) before sending PRs.
  We cannot accept code without this.
* Make your changes in a new git branch:

     ```shell
     git checkout -b my-fix-branch master
     ```

* Commit your changes using a descriptive commit message that follows our
  [commit message conventions](#commit). Adherence to these conventions
  is necessary because release notes are automatically generated from these messages.
* In GitHub, send a pull request.

That's it! Thank you for your contribution!

## <a name="commit"></a> Commit Message Guidelines
Read our [commit messages guidelines](docs/contribution/commit-messages-guidelines.md).


## <a name="cla"></a> Signing the CLA

Please sign our Contributor License Agreement (CLA) before sending pull requests. For any code changes to be accepted, the CLA must be signed. It's a quick process, we promise!

[Contributor License Agreement (CLA)][cla]

[cla]: https://agentcontribs.vidiun.org/
[dev-doc]: DEVELOPER.md
[github]: https://github.com/vidiun/vmc-ng
[github-issues]: https://github.com/vidiun/vmc-ng/issues
[js-style-guide]: https://google.github.io/styleguide/javascriptguide.xml
