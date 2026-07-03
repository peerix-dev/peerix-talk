import "@/lib/i18n.ts";
import { useRouter } from "@/hooks/use-router";
import { LobbyView } from "@/views/lobby/lobby-view";
// import { RoomView } from "@/views/room/room-view";

function App() {
  const { route, navigate } = useRouter();

  return (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      {route === "join" && <LobbyView onJoin={() => navigate("conference")} />}
      {/*{route === "conference" && <RoomView onLeave={() => navigate("join")} />}*/}
    </div>
  );
}

export { App };
