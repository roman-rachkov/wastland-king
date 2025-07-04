import { collection, getDocs, writeBatch, doc, setDoc } from 'firebase/firestore';
import { db } from "../../../../services/firebase";
import { Player } from "../../../../types/Player";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from 'luxon';
import {Alert, Button, FormText} from "react-bootstrap";

type ExtendedPlayer = Player & {
  firestoreId: string;
  created_at: DateTime;
};

const cleanupPlayers = async () => {
  // Get and transform documents
  const playersSnapshot = await getDocs(collection(db, 'players'));
  const players: ExtendedPlayer[] = playersSnapshot.docs.map(d => {
    const data = d.data();
    return {
      firestoreId: d.id,
      ...data,
      created_at: DateTime.fromJSDate(data.createdAt),
    } as ExtendedPlayer;
  });

  // Group by unique data (excluding id and firestoreId)
  const groups = new Map<string, ExtendedPlayer[]>();
  players.forEach(player => {
    const { id, firestoreId, created_at, updatedAt, createdAt, ...rest } = player;
    const key = JSON.stringify(Object.fromEntries(
      Object.entries(rest).sort(([a], [b]) => a.localeCompare(b))
    ));

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(player);
  });

  // Delete duplicates
  const deleteBatch = writeBatch(db);
  Array.from(groups.values()).forEach(group => {
    group.slice(1).forEach(({ firestoreId }) => {
      deleteBatch.delete(doc(db, 'players', firestoreId));
    });
  });
  await deleteBatch.commit();

  // Sort remaining by created_at
  const remaining = Array.from(groups.values()).map(g => g[0]);
  remaining.sort((a, b) => a.created_at.toMillis() - b.created_at.toMillis());

  // Generate new IDs
  const updateBatch = writeBatch(db);
  remaining.forEach((player, index) => {
    const newId = `PLAYER-${String(index + 1).padStart(6, '0')}`;
    updateBatch.update(
      doc(db, 'players', player.firestoreId),
      { id: newId }
    );
  });
  await updateBatch.commit();

  // Update counter
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

// Component with type checking
const PlayerCleanup = () => {
  const mutation = useMutation({
    mutationFn: cleanupPlayers,
  });

  return (
    <div>
      <Button
        variant={'secondary'}
        onClick={import.meta.env.DEV ? () => mutation.mutate() : undefined}
        disabled={import.meta.env.PROD ?? mutation.isPending}
      >
        {mutation.isPending ? 'Processing...' : 'Cleanup Players'}
      </Button>
      <FormText className={'ms-2'}>Clean up duplicate registration</FormText>
      <FormText className={'text-danger ms-2 fw-bold'}>DANGER! please save XLSX first</FormText>
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