import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Badge, ListGroup } from 'react-bootstrap';
import { Player } from '../../types/Player';
import { IAttackPlayer } from '../../types/Buildings';
import _ from 'lodash';

interface PlayerSearchProps {
  allPlayers: Player[] | undefined;
  attackPlayers: Player[] | undefined;
  selectedSchedule: any;
  onPlayerSelect: (player: Player) => void;
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({
  allPlayers,
  attackPlayers,
  selectedSchedule,
  onPlayerSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [playerNotFound, setPlayerNotFound] = useState(false);

  // Search players with debounce
  const searchPlayers = _.debounce(async (searchText: string) => {
    if (searchText.length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      setPlayerNotFound(false);
      return;
    }

    if (!allPlayers || !attackPlayers) return;

    // Search among all players (defense + attack)
    const allAvailablePlayers = [...allPlayers, ...attackPlayers];
    
    // Add attack players from current schedule (if they're not in loaded ones)
    if (selectedSchedule?.attackPlayers) {
      selectedSchedule.attackPlayers.forEach((attackPlayer: IAttackPlayer) => {
        // Check if such player already exists in the list
        const exists = allAvailablePlayers.some(p => p.id === attackPlayer.id);
        if (!exists) {
          // Convert IAttackPlayer to Player for search
          const playerForSearch: Player = {
            id: attackPlayer.id,
            name: attackPlayer.name,
            alliance: attackPlayer.alliance,
            troopTier: attackPlayer.troopTier,
            marchSize: attackPlayer.marchSize,
            rallySize: 0,
            troopFighter: attackPlayer.troopFighter,
            troopShooter: attackPlayer.troopShooter,
            troopRider: attackPlayer.troopRider,
            isCapitan: attackPlayer.isCapitan,
            isAttack: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            firstShift: false,
            secondShift: false
          };
          allAvailablePlayers.push(playerForSearch);
        }
      });
    }

    const results = allAvailablePlayers.filter(player => 
      player.name.toLowerCase().includes(searchText.toLowerCase()) ||
      player.alliance.toLowerCase().includes(searchText.toLowerCase())
    ).slice(0, 10); // Limit to 10 results

    setSearchResults(results);
    setShowSuggestions(results.length > 0);
  }, 300);

  const handleManualSearch = () => {
    if (!searchQuery.trim()) return;
    
    setPlayerNotFound(false);
    
    if (!allPlayers || !attackPlayers) return;

    // Search for exact match
    const allAvailablePlayers = [...allPlayers, ...attackPlayers];
    
    // Add attack players from schedule (if they're not in loaded ones)
    if (selectedSchedule?.attackPlayers) {
      selectedSchedule.attackPlayers.forEach((attackPlayer: IAttackPlayer) => {
        const exists = allAvailablePlayers.some(p => p.id === attackPlayer.id);
        if (!exists) {
          const playerForSearch: Player = {
            id: attackPlayer.id,
            name: attackPlayer.name,
            alliance: attackPlayer.alliance,
            troopTier: attackPlayer.troopTier,
            marchSize: attackPlayer.marchSize,
            rallySize: 0,
            troopFighter: attackPlayer.troopFighter,
            troopShooter: attackPlayer.troopShooter,
            troopRider: attackPlayer.troopRider,
            isCapitan: attackPlayer.isCapitan,
            isAttack: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            firstShift: false,
            secondShift: false
          };
          allAvailablePlayers.push(playerForSearch);
        }
      });
    }

    const exactMatch = allAvailablePlayers.find(player => 
      player.name.toLowerCase() === searchQuery.toLowerCase() ||
      player.alliance.toLowerCase() === searchQuery.toLowerCase()
    );

    if (exactMatch) {
      onPlayerSelect(exactMatch);
      setShowSuggestions(false);
    } else {
      setPlayerNotFound(true);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    setPlayerNotFound(false);
  };

  const handleSelectPlayer = (player: Player) => {
    setSearchQuery(player.name);
    setShowSuggestions(false);
    setPlayerNotFound(false);
    onPlayerSelect(player);
  };

  useEffect(() => {
    if (searchQuery) {
      searchPlayers(searchQuery);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
      setPlayerNotFound(false);
    }
  }, [searchQuery]);

  const getTroopTypes = (player: Player) => {
    const types = [];
    if (player.troopFighter) types.push('Fighter');
    if (player.troopShooter) types.push('Shooter');
    if (player.troopRider) types.push('Rider');
    return types;
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5>Search Player</h5>
      </Card.Header>
      <Card.Body>
        <Form.Group>
          <Form.Label>Player Name or Alliance</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Start typing player name or alliance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
            />
            <Button 
              variant="primary" 
              onClick={handleManualSearch}
              disabled={!searchQuery.trim()}
            >
              Search
            </Button>
            {searchQuery && (
              <Button 
                variant="outline-secondary" 
                onClick={handleClearSearch}
              >
                Clear
              </Button>
            )}
          </div>
        </Form.Group>

        {/* Search Suggestions */}
        {showSuggestions && (
          <ListGroup className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {searchResults.map(player => (
              <ListGroup.Item
                key={player.id}
                action
                onClick={() => handleSelectPlayer(player)}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>({player.alliance}) {player.name}</strong>
                  <br />
                  <small className="text-muted">
                    Tier: {player.troopTier} | March: {player.marchSize}
                  </small>
                </div>
                <div>
                  {getTroopTypes(player).map(type => (
                    <Badge key={type} bg="primary" className="me-1">{type}</Badge>
                  ))}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {/* Player Not Found */}
        {playerNotFound && (
          <Alert variant="warning" className="mt-2">
            Player not found. Please check the name or alliance and try again.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default PlayerSearch; 