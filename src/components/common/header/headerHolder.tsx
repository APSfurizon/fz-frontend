import { getUser } from "@/lib/api/user/server";
import Header from "./header";

export default async function HeaderHolder() {
  const data = await getUser();

  return (
    <>
      <Header userData={data.user} />
    </>
  );
}
