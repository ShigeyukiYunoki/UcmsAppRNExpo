import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";

  const db = SQLite.openDatabase("db");
  // テーブルを作成する
  export const createTable = () => {
    console.log("FileSystem; " + FileSystem.documentDirectory + "SQLite/");
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Medicines(ID INTEGER PRIMARY KEY NOT NULL, TookMedicineAt);`,
        [],
        () => {
          selectTookMedicineAt();
        // select();
        },
        () => {
          console.log("create table faile");
        }
      );
    });
  }

    export const createUsersTable = () => {
      db.transaction((tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS Users(ID INTEGER PRIMARY KEY NOT NULL UNIQUE, MaxDays, TakingMedicineAt);`,
          [],
          () => {
            console.log("create table");
            // db.transaction((tx) => {
            //   tx.executeSql("insert into Users (MaxDays) values (0);"),
            //     () => {
            //       console.log("insert success");
            //     };
            // });
          }
        );
      });
    }

  export const insertMedicine = (TookMedicineAt) => {
    db.transaction((tx) => {
      tx.executeSql(
        // ?のところに引数で設定した値が順番に入る
        "insert into Medicines (TookMedicineAt) values (?);",
        [TookMedicineAt],
        () => {
          console.log("insert success");
        },
        () => {
          console.log("insert faile");
        }
      );
    });
  };

  export const deleteMedicine = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `delete from Medicines where TookMedicineAt="2022-08-02";`,
        () => {
          console.log("delete success");
        },
        () => {
          console.log("delete faile");
        }
      );
    });
  }
  export const deleteUser = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `delete from Users;`,
        () => {
          console.log("delete success");
        },
        () => {
          console.log("delete faile");
          return false;
        }
      );
    });
  }

  export const selectTookMedicineAt = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `select TookMedicineAt from Medicines order by TookMedicineAt asc`,
        [],
        (_tx, results) => {
          const len = results.rows.length;
          const items = [];
          for (let i = 0; i < len; i++) {
            const t = results.rows.item(i).TookMedicineAt;
            items.push(t);
          }
          console.log(items);
          return items;
        },
        () => {
          console.log("select faile");
          return false;
        }
      );
    });
  }

  export const insertMaxDays = (id, MaxDays) => {
    db.transaction((tx) => {
      tx.executeSql(
        // ?のところに引数で設定した値が順番に入る
        "insert into Users (id, MaxDays) values (?, ?);",
        [id, MaxDays],
        () => {
          console.log("insert success");
        },
        () => {
          console.log("insert faile");
        }
      );
    });
  };

  export const selectMaxDays = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `select MaxDays from Users where id = 1`,
        [],
        // 成功時のコールバック関数
        (_tx, results) => {
          console.log("select success");
          console.log("select result:" + results.rows.item(0).MaxDays);
          return results.rows.item(0).MaxDays;
        },
        () => {
          // 失敗時のコールバック関数
          console.log("select faile");
          return false;
        }
      );
    });
  }

  export const updateMaxDays = (Max) => {
    db.transaction((tx) => {
      tx.executeSql(
        `update Users set MaxDays=?;`,
        [Max],
        () => {
          console.log("update success");
        },
        () => {
          console.log("update faile");
          return false;
        }
      );
    });
  }