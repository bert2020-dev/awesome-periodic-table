# ⚛️ Awesome Periodic Table

### Chemistry is full of connections. Finding them should be simple.

**Awesome Periodic Table is a free, open-source, interactive periodic table built for learning, exploration, and discovery.**

Explore the elements, investigate their properties, compare them, and search for exactly what you're curious about — even using natural-language-style queries instead of rigid filters.

Whether you're a student preparing for an exam, a teacher looking for an educational resource, a science enthusiast, or simply someone curious about the world around you, this project is designed to make chemistry more approachable.

**No installation. No dependency hunting. No complicated setup. Just download, open, and explore.**

---

## 🚀 Get Started — Download the App

**You do not need to be a programmer to use Awesome Periodic Table.**

The ready-to-use application is available in the repository's `dist` folder. These are the prebuilt versions of the app, not the development source code.

### 📥 Download the application

| Version            | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| **Arcager (Gzip)** | Standard optimized release. Recommended for most users.                     |
| Arcager (Brotli)   | Alternative compressed release.                                             |
| Plain              | Standalone build using a more readable, debug-friendly data representation. |

➡️ **[Browse the ready-to-use downloads in `dist`](https://github.com/bert2020-dev/awesome-periodic-table/tree/main/dist)**

### How to download and open it

1. Click the `dist` folder using the link above.
2. Open the `arcager` folder to find the standard release, or choose another build if you prefer.
3. Click `awesome-periodic-table.html`.
4. On the file page, click the **Download raw file** button (or the download option provided by GitHub).
5. Save the HTML file somewhere easy to find, such as your Downloads folder or Desktop.
6. Double-click the downloaded file.

That's it! Your web browser should open the application.

You do **not** need to install Node.js, Python, Git, Arcager, or any other development tool.

> **Having trouble finding the download button?** Make sure you're downloading the `.html` file itself, not the repository's source code. You don't need to download the entire repository to use the application.

### Which version should I choose?

If you're unsure, start with **Arcager (Gzip)**. It's the standard optimized distribution.

All the provided builds are intended to be standalone HTML applications. You can keep the downloaded file on your computer and open it whenever you want to explore the periodic table.

---

## ✨ What Makes Awesome Periodic Table Different?

A periodic table is more than a chart of 118 elements. It's a gateway to understanding the materials, reactions, and physical properties that shape our world.

Awesome Periodic Table aims to make that gateway easier to explore.

### 🔎 Search Chemistry in Your Own Words

One of the project's defining features is its built-in, NLP-like search engine.

Instead of forcing you to navigate a maze of menus or remember a rigid query syntax, the search engine is designed to interpret flexible, human-readable descriptions of what you're looking for.

For example, you can explore queries such as:

* `liquid or gas`
* `radioactive`
* `boils above 2552.2`
* `after 1800 and before 2000`
* `solid, radioactive, melts below 500c`

Combine properties, narrow down results, and investigate relationships between elements using a search experience designed to feel natural.

The goal isn't to make you learn a query language. It's to let you ask chemistry-related questions in a way that feels familiar.

The search engine is still evolving, but its purpose is clear: **make finding elements as intuitive as thinking about their properties.**

### 🧪 Explore More Than Element Names

Discover elements through their properties, not just their position on the table.

Awesome Periodic Table brings together a wide range of information, including physical, chemical, thermal, electrical, and nuclear properties.

Explore individual elements, inspect their data, and use the table to investigate questions such as:

* Which elements are liquid at a given temperature?
* Which elements have melting points within a particular range?
* How do the properties of two elements compare?
* Which elements share a particular characteristic?
* How do properties change across different regions of the periodic table?

The application is designed to support both casual exploration and more focused educational or scientific use.

### 🌡️ Explore the Table at Different Temperatures

Chemistry doesn't stop at room temperature.

Use the temperature controls to explore how an element's physical state changes under different conditions.

Move through temperatures and observe how the table responds, making it easier to connect numerical data with the behavior of real elements.

### ⚖️ Compare Elements and Discover Connections

The interactive table makes it easy to move between elements, inspect their details, and compare their properties.

Rather than treating each element as an isolated collection of facts, the application encourages you to look for patterns, similarities, and differences.

### 🧭 Designed for Exploration

The interface is built around interacting with the periodic table itself.

Explore elements, inspect additional information, filter the table, and follow your curiosity without needing to navigate away from the application every time you want to investigate something new.

---

## ⚡ Fast, Simple, and Ready to Use

Awesome Periodic Table is designed to avoid unnecessary barriers between users and the information they want to explore.

| Feature                                 | What it means for you                                                                         |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| **No installation dependencies**        | No package managers, runtimes, or libraries to install just to use the app.                   |
| **Standalone HTML distribution**        | Download the application as a single HTML file.                                               |
| **Lightweight, optimized builds**       | Bundled and compressed distributions help keep the application practical to download and use. |
| **Browser-based**                       | Open the downloaded file in a modern web browser.                                             |
| **No development environment required** | You don't need to know how to code or use a terminal.                                         |
| **Open source**                         | The source is available for inspection, learning, and contribution.                           |

The idea is simple: **the software should be easy to access, not another obstacle to learning.**

---

## 🎓 Built for Learning, Open to Everyone

Awesome Periodic Table is primarily an educational project.

It is intended for anyone who wants to understand chemistry better, whether that means studying for a test, preparing a lesson, investigating an interesting element, or simply satisfying a little curiosity.

### For students

Explore element properties, investigate search results, and use the table as a companion while studying chemistry.

### For teachers and educators

Use the interactive table as a resource for demonstrations, classroom exploration, or independent learning.

### For science enthusiasts

Follow your curiosity, investigate unusual properties, and discover connections between elements.

### For developers and researchers

Inspect the source, examine the data pipeline, experiment with the search engine, and build upon the project.

You don't need to fit into any one of these groups. If you're curious about chemistry, you're welcome here.

---

## 🛠️ For Developers and Contributors

Awesome Periodic Table is also an open-source software project.

The repository separates the editable application source, CSV data, build tools, and distributable HTML files. This makes it possible to work on the project without treating the ready-to-use application as the development environment.

### Repository Structure

```text
awesome-periodic-table/
├── src/
│   ├── index.html
│   ├── css/
│   │   └── app.css
│   └── js/
│       ├── app.js
│       └── data-bootstrap.js
├── data/
│   └── *.csv
├── tools/
│   ├── build.mjs
│   ├── data-pipeline.mjs
│   ├── pipe-runtime.mjs
│   ├── arcager-adapter.mjs
│   └── search-harness.mjs
├── tests/
├── vendor/
│   └── Arcager/
├── dist/
│   ├── plain/
│   └── arcager/
└── README.md
```

### Data and Build Architecture

CSV files serve as the canonical editable data source.

The build system provides two deliberate data paths:

* **Plain:** Embeds a compact pipe-delimited representation, producing a standalone HTML build with a more readable, debug-friendly data format.
* **Arcager:** Uses Arcager to bundle, compress, and reconstruct CSV resources in memory for the optimized distribution.

Both approaches produce standalone HTML applications. The original CSV files are build-time inputs and do not need to accompany the generated application.

### Search Engine and Runtime

The application uses a reusable object-oriented runtime to organize its data and search logic.

Its core components include:

* `PropertyCatalog` — resolves searchable properties and dimensions.
* `ElementDataRepository` — manages indexed data and value caches.
* `SearchEngine` — handles query evaluation and result caching.
* `TableRenderer` — manages element DOM nodes and in-place temperature updates.

Multi-dimensional data is handled consistently, including abundance dimensions, ionization-energy sequences, and isotope collections.

### Build Commands

To build the project, you'll need a suitable Node.js development environment.

```bash
npm run build
```

This produces the standard Arcager/Gzip release.

Other available commands:

```bash
npm run build:plain
npm run build:arcager
npm run build:arcager:brotli
```

### Testing

Run the test suite with:

```bash
npm test
```

The suite covers source and schema checks, data serialization, search regressions, multi-value search behavior, standalone builds, and Arcager packing/unpacking.

---

## 🔐 Transparency, Licensing, and Data Attribution

Awesome Periodic Table is an open-source project. Its source code and build process are available for inspection, allowing users and contributors to better understand how the application is assembled.

The project also uses a dual-licensing arrangement. **Open source does not automatically mean that every component can be reused under the same terms.**

Before creating a derivative or commercial build, please read:

* [`docs/LICENSE-BUILDERS.md`](docs/LICENSE-BUILDERS.md)

The project credits `periodictable.com` for its Universe and Human abundance source pages and identifies the provenance published for those datasets.

Please consult the repository's licensing and attribution documentation before redistributing modified versions or incorporating project materials into other applications.

---

## 🤝 Contributing

Awesome Periodic Table is an evolving project, and contributions are welcome.

Whether you're interested in improving the search engine, refining the interface, reviewing data, expanding documentation, or helping make chemistry more accessible, your involvement can help the project grow.

You don't need to be an expert in every part of the codebase to contribute. Thoughtful feedback, reproducible bug reports, and educational use cases are valuable too.

To get started, explore the repository, review the existing issues, and share your ideas or improvements.

---

## 📦 Releases and Versioning

**Current version: 0.5.12**

The project follows semantic-style `X.Y.Z` versioning:

* **X** — major or incompatible architectural changes
* **Y** — backward-compatible features
* **Z** — bug fixes and maintenance

For the latest source, build files, and release updates, visit the repository:

**[Awesome Periodic Table on GitHub](https://github.com/bert2020-dev/awesome-periodic-table)**

---

## ❤️ A Final Word

Awesome Periodic Table started from a simple idea: exploring chemistry should be easier, more interactive, and more accessible.

It's an educational project first and foremost, built with the hope that a useful tool can help someone understand a subject, discover something unexpected, or simply enjoy learning.

If you find it useful, share it with a student, a teacher, a friend, or anyone who might enjoy exploring the elements.

**Download it. Open it. Explore.**

Curiosity is all you need.
s