# Irrevocable Bid Frontend

## Usage

Build the `irrevocablebid-contracts` library following instructions in its README.

Create a symlink to the `irrevocablebid-contracts` library folder:

```
ln -s ../path/to/irrevocablebid-contracts/lib lib
```

Install:

```
npm install
```

Build frontend:

```
npm run build
```

Start webpack development server (this automatically rebuilds):

```
npm run start
```

## File Structure

* [`src/`](src/) - Sources
    * `create/` - Create View
    * `guarantee/` - Guarantee View
        * `components/`
    * `seller/` - Seller View
        * `components/`
        * `modals/`
    * `guarantor/` - Guarantor View
        * `components/`
        * `modals/`
    * `components/` - Common components
    * `helpers.ts` - Helper functions
    * `index.tsx` - Top-level application
    * `index.html` - Top-level HTML
* [`tsconfig.json`](tsconfig.json) - TypeScript configuration
* [`package.json`](package.json) - npm package metadata
* [`package-lock.json`](package-lock.json) - npm package lock

## License

TBD
