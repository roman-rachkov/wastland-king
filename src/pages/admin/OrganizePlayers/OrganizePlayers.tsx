import {useQuery} from "@tanstack/react-query";
import {fetchWastelandDates} from "../../../api/fetchWastelandDates.ts";
import {organizePlayers} from "./utils.tsx";
import {fetchPlayers} from "../../../api/fetchPlayers.ts";
import {Table} from "react-bootstrap";

const OrganizePlayers = () => {
  const {data: dates, isLoading: datesIsloading, isError: datesIsError, error: datesError} = useQuery({
    queryKey: ['wastelandDates'],
    queryFn: fetchWastelandDates
  });

  const {data: playersData, isLoading: playersIsLoading, isError: playersIsError, error: playersError} = useQuery({
    queryKey: ['players'],
    queryFn: () => fetchPlayers(dates!),
    enabled: !!dates
  });

  const data = organizePlayers(playersData ?? [])

  console.log(playersData, data);

  return (
    <div>
      {data.buildings.map(item => {
        console.log(item)
        return (<Table striped key={item.id}>

        </Table>);
      })}
      </div>
  );
};

export default OrganizePlayers;