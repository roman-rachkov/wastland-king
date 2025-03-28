import { collection, getDocs, writeBatch, doc, setDoc } from 'firebase/firestore';
import { db } from "../../../../services/firebase.ts";
import { Player } from "../../../../types/Player.ts";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from 'luxon';
import {Alert, Button} from "react-bootstrap";

type ExtendedPlayer = Player & {
  firestoreId: string;
  created_at: DateTime;
};

const cleanupPlayers = async () => {
  // Получаем и преобразуем документы
  const playersSnapshot = await getDocs(collection(db, 'players'));
  const players: ExtendedPlayer[] = playersSnapshot.docs.map(d => {
    const data = d.data();
    return {
      firestoreId: d.id,
      ...data,
      created_at: DateTime.fromJSDate(data.createdAt),
    } as ExtendedPlayer;
  });

  // Группировка по уникальным данным (исключая id и firestoreId)
  const groups = new Map<string, ExtendedPlayer[]>();
  players.forEach(player => {
    const { id, firestoreId, created_at, updatedAt, createdAt, ...rest } = player;
    const key = JSON.stringify(Object.fromEntries(
      Object.entries(rest).sort(([a], [b]) => a.localeCompare(b))
    ));

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(player);
  });

  // Удаление дубликатов
  const deleteBatch = writeBatch(db);
  Array.from(groups.values()).forEach(group => {
    group.slice(1).forEach(({ firestoreId }) => {
      deleteBatch.delete(doc(db, 'players', firestoreId));
    });
  });
  await deleteBatch.commit();

  // Сортировка оставшихся по created_at
  const remaining = Array.from(groups.values()).map(g => g[0]);
  remaining.sort((a, b) => a.created_at.toMillis() - b.created_at.toMillis());

  // Генерация новых ID
  const updateBatch = writeBatch(db);
  remaining.forEach((player, index) => {
    const newId = `PLAYER-${String(index + 1).padStart(6, '0')}`;
    updateBatch.update(
      doc(db, 'players', player.firestoreId),
      { id: newId }
    );
  });
  await updateBatch.commit();

  // Обновление счетчика
  await setDoc(
    doc(db, 'counters', 'players'),
    { count: remaining.length },
    { merge: true }
  );

  return {
    deleted: players.length - remaining.length,
    updated: remaining.length
  };
};

// Компонент с типизацией
const PlayerCleanup = () => {
  const mutation = useMutation({
    mutationFn: cleanupPlayers,
  });

  return (
    <div>
      <Button
        variant={'secondary'}
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Processing...' : 'Cleanup Players'}
      </Button>

      {mutation.isError && (
        <Alert variant={'danger'}>Error: {(mutation.error as Error).message}</Alert>
      )}

      {mutation.isSuccess && (
        <Alert variant={'success'}>
          Success! Deleted {mutation.data.deleted} duplicates,
          updated {mutation.data.updated} players.
        </Alert>
      )}
    </div>
  );
};

export default PlayerCleanup;