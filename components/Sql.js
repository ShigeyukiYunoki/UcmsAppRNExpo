import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

  const db = SQLite.openDatabase("db");
  export const createTable = () => {
    console.log("FileSystem; " + FileSystem.documentDirectory + "SQLite/");
    Sharing.shareAsync(
      FileSystem.documentDirectory + 'SQLite/', 
      {dialogTitle: 'share or copy your DB via'}
    ).catch(error =>{
      console.log(error);
    });

    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Users(ID INTEGER PRIMARY KEY NOT NULL, TakingMedicineAt);`,
        [],
        () => {
          console.log("create Users table success");
        },
        () => {
          console.log("create Users table faile");
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Medicines(ID INTEGER PRIMARY KEY NOT NULL, TookMedicineAt);`,
        [],
        () => {
          console.log("create Medicines table success");
          db.transaction((tx) => {
            tx.executeSql(
              "replace into Medicines (id, TookMedicineAt) values (1, null);",
              [],
              () => {
                console.log("insert TookMedicineAt success");
              },
              () => {
                console.log("insert faile");
              }
            );
          });
        },
        () => {
          console.log("create Medicines table faile");
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Days(ID INTEGER PRIMARY KEY NOT NULL, Days);`,
        [],
        () => {
          console.log("create Days table success");
        },
        () => {
          console.log("create Days table faile");
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
          console.log("insert TookMedicineAt success");
        },
        () => {
          console.log("insert TookMedicineAt faile");
        }
      );
    });
  };

  export const deleteMedicine = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `delete from Medicines where TookMedicineAt="2022-08-24"`,
        () => {
          console.log("delete TookMedicineAt success");
        },
        () => {
          console.log("delete TookMedicineAt faile");
        }
      );
    });
  }

  export const dropTable = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `drop table Users`,
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

  export const replaceDays = (id, Days) => {
    db.transaction((tx) => {
      tx.executeSql(
        "replace into Days (id, Days) values (?, ?);",
        [id, Days],
        () => {
          console.log("replace Days success");
        },
        () => {
          console.log("replace faile");
        }
      );
    });
  };