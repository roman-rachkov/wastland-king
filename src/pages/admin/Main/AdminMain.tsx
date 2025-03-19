// 1. Установите зависимости:
// npm install @tanstack/react-table @tanstack/react-query firebase luxon

// 2. Инициализация Firebase
import {collection, getDocs} from 'firebase/firestore';
import {DateTime} from 'luxon';

// 3. Создаем компонент таблицы
import {useQuery} from '@tanstack/react-query';
import {ColumnDef, flexRender, getCoreRowModel, useReactTable,} from '@tanstack/react-table';
import {db} from "../../../services/firebase.ts";
import {Table} from "react-bootstrap";
import {Player} from "../../../types/Player.ts";



const columns: ColumnDef<Player>[] = [
  {
    header: 'ID',
    accessorKey: 'id',
  },
  {
    header: 'Created At',
    accessorFn: row => DateTime.fromJSDate(row.createdAt).toFormat('dd.MM.yyyy HH:mm'),
  },
  {
    header: 'Updated At',
      accessorFn: row => DateTime.fromJSDate(row.updatedAt).toFormat('dd.MM.yyyy HH:mm'),
  },
  {
    header: 'Name',
    accessorKey: 'name',
  }, {
    header: 'Alliance',
    accessorKey: 'alliance',
  }, {
    header: 'First shift',
    accessorKey: 'firstShift',
  }, {
    header: 'Second Shift',
    accessorKey: 'secondShift',
  }, {
    header: 'Troop tier',
    accessorKey: 'troopTier',
  }, {
    header: 'Is Fighter',
    accessorKey: 'troopFighter',
  }, {
    header: 'Is Shooter',
    accessorKey: 'troopShooter',
  }, {
    header: 'Is Rider',
    accessorKey: 'troopRider',
  }, {
    header: 'Is Capitan',
    accessorKey: 'isCapitan',
  }, {
    header: 'March size',
    accessorKey: 'marchSize',
  },
  {
    header: 'Rally size',
    accessorKey: 'rallySize',
  },

];

const fetchPlayers = async (): Promise<Player[]> => {
  const querySnapshot = await getDocs(collection(db, 'players'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as Player[];
};

function AdminMain() {
  const {data, isLoading, isError} = useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
  });

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;

  return (
    <div className="p-2">
      <Table responsive className="w-full border-collapse">
        <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th
                key={header.id}
                className="border-b p-2 text-left font-semibold"
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </th>
            ))}
          </tr>
        ))}
        </thead>
        <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id} className="hover:bg-gray-50">
            {row.getVisibleCells().map(cell => (
              <td key={cell.id} className="border-b p-2">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
        </tbody>
      </Table>
    </div>
  );
}

export default AdminMain;