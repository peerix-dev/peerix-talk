import { HugeiconsIcon } from "@hugeicons/react";
import { Mic01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function App() {
  return (
    <div className="flex h-full w-full flex-col justify-center items-center gap-4">
      <h1>Peerix Talk</h1>
      <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
      <Button variant="outline" size="icon-lg">
        <HugeiconsIcon icon={Mic01Icon} />
      </Button>
    </div>
  );
}

export default App;
