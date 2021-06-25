
export enum MapChunkType {
	UnknownType = 0,

	/// Save Game
	CommentText = 250,
	SaveGameGeneralInformation = 130,
	SaveGameMapLandscape = 200,

	/// Game Map
	MapGeneralInformation = 1,
	MapPlayerInformation = 2,
	MapTeamInformation = 3,
	MapPreview = 4,
	MapUnknown5 = 5,
	MapObjects = 6,
	MapSettlers = 7,
	MapBuildings = 8,
	MapStacks = 9,
	MapUnknown10 = 10,
	MapQuestText = 11,
	MapQuestTip = 12,
	MapLandscape = 13,
}
