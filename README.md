![image](./art/logo-small.png)
A free, open-source code editor for classroom tests and exams. LoCode runs locally on the teacher's machine  students join over the LAN and submit their work straight to the teacher's computer. No cloud, no accounts.

## The Code Editor
The editor is based on [VDB-Editor](https://github.com/TibeDev/VDB-Editor), another project of mine.

## Features

- **Runs locally**  the teacher's machine hosts the session; students join over the local network. No internet required.
- **SEB file generator**  generates a ready-to-use `.seb` file for your session, with the URL and lockdown settings already configured.

## Supported languages

| Language   | Status |
| ---------- | ------ |
| HTML       | ✅     |
| CSS        | ✅     |
| JavaScript | ✅     |

More languages soon

## Safe Exam Browser

LoCode works with [Safe Exam Browser](https://safeexambrowser.org) for locked-down exam conditions. The built-in generator produces a `.seb` file configured for your session, including the session URL, URL filtering, and quit/settings passwords  so you don't have to configure SEB by hand.

Of course you don't have to use SEB, you can also provide the students with a link to the editor.

## License

Licensed under the PolyForm Noncommercial License 1.0.0. Free to use, modify, and share for noncommercial purposes. See [`LICENSE`](./LICENSE) for details.
