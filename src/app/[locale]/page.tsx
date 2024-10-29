import Button from "../_components/button";
import { ICONS } from "../_components/icon";

export default function Home() {
  return (
    <div>
      <main>
        <Button iconName={ICONS.ADD_CIRCLE}>Register</Button>
      </main>
    </div>
  );
}
