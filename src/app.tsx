import { Toaster } from "sonner";
import "@/lib/i18n.ts";
import { RoomProvider } from "@/hooks/use-room";
import { RoomController } from "@/views/room-controller";

function App() {
  return (
    <RoomProvider>
      <RoomController />
      <Toaster />
    </RoomProvider>
  );
}

export { App };
