import { getSortedMigrationFiles } from "./../getSortedMigrationFiles";
import fs from "fs/promises";
export const refreshIndex = async ({
  migrationDir,
  esm,
  ts,
}: {
  migrationDir: string;
  esm: boolean;
  ts: boolean;
}) => {
  const sortedFiles = await getSortedMigrationFiles({ migrationDir });
  const importContent = sortedFiles.reduce(
    (acc, name) => `${acc}
  import * as ${name} from "./${name}${esm ? ".js" : ""}";
  `,
    ""
  );
  const exportList = sortedFiles.reduce(
    (acc, name) => `${acc},
    ${name}`,
    ""
  );
  const content = `${importContent}
  
  export const migrations = {
  ${exportList.slice(2)}
  };
    `;
  await fs.writeFile(`${migrationDir}/index.${ts ? "ts" : "js"}`, content);
};
