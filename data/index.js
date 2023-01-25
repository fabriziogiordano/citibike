const myStations = [
  {
    label: "Home",
    name: "Pearl St & Hanover Square",
    order: 0,
  },
  {
    label: "Work",
    name: "W 33 St & 10 Ave",
    order: 1,
  },
  {
    label: "Work 2",
    name: "W 34 St & Hudson Blvd E",
    order: 2,
  },
  {
    label: "Subway Penn 1",
    name: "W 36 St & 7 Ave",
    order: 3,
  },
  {
    label: "Subway Penn 2",
    name: "W 31 St & 7 Ave",
    order: 4,
  },
];

async function findStations() {
  const url = "https://gbfs.citibikenyc.com/gbfs/en/station_information.json";
  let data = await fetch(url);

  if (data.status === 200) {
    let {
      data: { stations },
    } = await data.json();

    const myStationNames = myStations.map(({ name }) => name);
    stations = stations.map(station => {
      if (myStationNames.includes(station.name)) {
        const mine = myStations.find(s => s.name === station.name);
        return {
          ...station,
          label: mine.label,
          order: mine.order,
        }
      }

      return {}
    });

    return stations;
  }
}

export async function findAvailability() {
  const myStations = await findStations();

  const url = "https://gbfs.citibikenyc.com/gbfs/en/station_status.json";
  let data = await fetch(url);

  if (data.status === 200) {
    let {
      data: { stations },
      last_updated
    } = await data.json();

    const myStationId = myStations.map(({ station_id }) => station_id);

    const myStationsFiltered = [];
    stations = stations.map((station) => {
      // Filter only the stations I care about
      if (myStationId.includes(station.station_id)) {
        const myStation = myStations.find(({ station_id }) => station_id === station.station_id);
        myStationsFiltered.push({
          raw: {
            station,
            myStation
          },
          station_id: station.station_id,
          label: myStation.label,
          order: myStation.order,
          monster: 'true',
          name: myStation.name,
          num_bikes_available: station.num_bikes_available,
          num_ebikes_available: station.num_ebikes_available,
          num_docks_available: station.num_docks_available,
          lat: myStation.lat,
          lon: myStation.lon,
        });
      }
    });

    myStationsFiltered.sort((orderFirst, orderSecond) => orderFirst.order - orderSecond.order);
    // console.log(JSON.stringify(myStationsFiltered, null, 2));
    const delta = Math.round(new Date() / 1000) - last_updated;
    return {last_updated, delta, data: myStationsFiltered};
  }
}
