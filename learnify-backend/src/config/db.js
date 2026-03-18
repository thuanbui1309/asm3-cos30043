const postgres = require('postgres');

const connection = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});

const handler = {
  apply(target, thisArg, args) {
    const promise = target.apply(thisArg, args);
    return promise.then(rows => {
      rows.rows = rows;
      return rows;
    });
  },
};

const sql = new Proxy(connection, handler);

module.exports = { sql };
