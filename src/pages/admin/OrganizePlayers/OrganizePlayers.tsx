import { Alert, Row, Col } from "react-bootstrap";
import EditBuildingModal from "../../../components/players/EditBuildingModal";
import AvailablePlayersList from "../../../components/players/AvailablePlayersList";
import PlayersStats from "../../../components/players/PlayersStats";
import { useOrganizePlayers } from "../../../hooks/useOrganizePlayers";
import { ControlPanel, SaveScheduleModal } from "../../../components/admin/OrganizePlayers";
import ScheduleDisplay from "../../../components/common/ScheduleDisplay";

const OrganizePlayers = () => {
  const {
    // State
    showEditModal,
    selectedBuilding,
    showSaveModal,
    showPlayersList,
    showStats,
    saveNotification,
    itemsPerPage,
    
    // Data
    dates,
    players,
    attackPlayers,
    buildings,
    existingSchedule,
    settings,
    availableDefensePlayers,
    
    // Loading states
    datesIsLoading,
    playersIsLoading,
    scheduleIsLoading,
    
    // Handlers
    setShowEditModal,
    setShowSaveModal,
    setShowPlayersList,
    setShowStats,
    setSaveNotification,
    setSettings,
    handleEditBuilding,
    handleSaveBuilding,
    handleAutoAllocate,
    handleClearSchedule,
    handleClearBuilding,
    handleSaveSchedule,
  } = useOrganizePlayers();

  // Show loading state while data is being fetched
  if (datesIsLoading || playersIsLoading || scheduleIsLoading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading schedule data...</p>
      </div>
    );
  }

  return (
    <div>
      {saveNotification && (
        <Alert 
          variant={saveNotification.type === 'success' ? 'success' : 'danger'} 
          className="mb-3"
          onClose={() => setSaveNotification(null)}
          dismissible
        >
          {saveNotification.message}
        </Alert>
      )}
      
      <Row>
        {/* Control Panel Sidebar */}
        <Col lg={3} className="mb-4">
          <div style={{ position: 'sticky', top: '20px' }}>
            <ControlPanel
              settings={settings || { shiftDuration: 4, allowAttackPlayersInDefense: false }}
              setSettings={setSettings}
              showStats={showStats}
              setShowStats={setShowStats}
              showPlayersList={showPlayersList}
              setShowPlayersList={setShowPlayersList}
              handleAutoAllocate={handleAutoAllocate}
              handleClearSchedule={handleClearSchedule}
              setShowSaveModal={setShowSaveModal}
              availableDefensePlayers={availableDefensePlayers || []}
              buildings={buildings || []}
            />
          </div>
        </Col>

        {/* Main Content */}
        <Col lg={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fas fa-users me-2"></i>
              Player Organization
            </h2>
            <div className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Use the control panel on the left to manage your schedule
            </div>
          </div>

          {showStats && players && (
            <div className="mb-4">
              <PlayersStats 
                players={players} 
                buildings={buildings} 
                attackPlayers={attackPlayers?.map(player => ({
                  id: player.id,
                  name: player.name,
                  alliance: player.alliance,
                  troopTier: player.troopTier,
                  marchSize: player.marchSize,
                  isCapitan: player.isCapitan,
                  troopFighter: player.troopFighter,
                  troopShooter: player.troopShooter,
                  troopRider: player.troopRider
                })) || []} 
              />
            </div>
          )}

          {!existingSchedule && buildings?.every(b => !b.capitan.id) && (
            <Alert variant="info" className="mb-4">
              <strong>Welcome!</strong> Your schedule is empty. Click "Auto Fill Schedule" to automatically assign players and captains, or manually edit each building.
            </Alert>
          )}

          {showPlayersList && players && (
            <div className="mb-4">
              <AvailablePlayersList players={availableDefensePlayers || []} buildings={buildings || []} attackPlayers={attackPlayers || []} />
            </div>
          )}

          <ScheduleDisplay
            buildings={buildings || []}
            settings={settings || { shiftDuration: 4, allowAttackPlayersInDefense: false }}
            dates={dates}
            attackPlayers={attackPlayers || []}
            itemsPerPage={itemsPerPage}
            onEdit={handleEditBuilding}
            onClear={handleClearBuilding}
          />
        </Col>
      </Row>

      {/* Building edit modal */}
      {selectedBuilding && (
        <EditBuildingModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          building={selectedBuilding}
          availablePlayers={availableDefensePlayers || []}
          onSave={handleSaveBuilding}
          allBuildings={buildings || []}
          attackPlayers={attackPlayers || []}
          shiftCount={(settings?.shiftDuration || 4) === 4 ? 2 : 4}
        />
      )}

      {/* Schedule save modal */}
      <SaveScheduleModal
        show={showSaveModal}
        onHide={() => setShowSaveModal(false)}
        onSave={handleSaveSchedule}
        dates={dates}
        existingSchedule={existingSchedule}
        saveNotification={saveNotification}
      />
    </div>
  );
};

export default OrganizePlayers;