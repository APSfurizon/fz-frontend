import DataForm from "@/app/_components/dataForm";
import JanInput from "@/app/_components/janInput";
import { LoginFormAction } from "@/app/_lib/api/login";
import Link from "next/link";

export default function Login() {



    return (
      <div>
        <main>
          <DataForm action={new LoginFormAction}>
            <JanInput fieldName="email" inputType="text" label={"Password"} placeholder="Insert password"/>
            <JanInput fieldName="password" inputType="password" label={"Password"} placeholder="Insert password"/>
          </DataForm>
        </main>
      </div>
    );
  }
  