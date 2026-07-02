import "@/lib/i18n.ts";
import { useRouter } from "@/hooks/use-router";
import { JoinView } from "@/views/join/join-view";
// import { ConfView } from "@/views/conference/conf-view";

function App() {
  const { route, navigate } = useRouter();

  return (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      {route === "join" && <JoinView onJoin={() => navigate("conference")} />}
      {/*{route === "conference" && <ConfView onLeave={() => navigate("join")} />}*/}
    </div>
  );
}

export { App };
