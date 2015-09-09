//
//  GameField.h
//  6Corners
//
//  Created by Andrey Yastrebov on 2/8/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"

#define degreesToRadian(x) (M_PI * (x) / 180.0)

#define kLeftMove 1
#define kRightMove 2
#define kDownMove 3
#define kUpMove 4

#define kNextFigureTag 300

@class Figure;
@class SectionArray;
@class GlobalSettings;
@class Audio;
@class WinLoseScene;
@class PauseScene;

@interface GameField : CCLayer 
{
	CGPoint respawn;
	int xOffset;
	int yOffset;
	BOOL upDown;
	BOOL isLeftBound;
	BOOL isRightBound;
	BOOL isLowerBound;
	BOOL canRotate;
	BOOL gameOver;
	BOOL fastFigureMove;
	BOOL isEndlessMode;
	id rotateAction;
	
	CCTMXTiledMap *hexMap;
	Figure *figure;
	SectionArray *abstractHexMap;
	CCArray *blocksPositions;
	CCArray *actualBlocksPositions;
	GlobalSettings *settings;
	CCArray *hexes;
	CCArray *winHexes;
	CCMenuItem *pauseButton;
	PauseScene *pauseScene;
	WinLoseScene *winLose;
	
	CGPoint startMove;
	CGPoint endMove;
	
	NSUInteger current;
	
	CCParticleSystem *emitter;
	
	NSUInteger scoreCount;
	NSUInteger linesCount;
	NSUInteger level;
	NSUInteger endlessModeSpeed;
	CGFloat dropInterval;
	float timeCount;
	
	CCLabelBMFont *scoreLabel;
	CCLabelBMFont *linesLabel;
	CCLabelBMFont *levelLabel;
	
	Audio *audioInGame;
	
	NSString *gameFieldPath;
	NSString *figuresPath;
}

@property (nonatomic, retain) CCTMXTiledMap *hexMap;
@property (nonatomic, retain) CCMenuItem *pauseButton;
@property (readwrite,retain) CCParticleSystem *emitter;
@property NSUInteger level;
@property BOOL isEndlessMode;
@property NSUInteger endlessModeSpeed;

+ (id) scene;
- (void)spawnFigure;
- (void)recalcBlockPositions:(CCArray *)pointsToCalc;
- (CGPoint)CGPointAdd:(CGPoint)a second:(CGPoint)b;
- (void)showPos;
- (void)showActualPos;
- (void)checkBounds:(id)sender;
- (void)freezeAndAddNew;
- (void)applyRotateMatrix;
- (BOOL)isRotateAllowed;
- (void)checkNeighbours:(NSUInteger)moveType;
- (void)moveFigureUp:(id)sender;
- (void)moveFigureLeft:(id)sender;
- (void)moveFigureRight:(id)sender;
- (void)moveFigureDown:(id)sender;
- (void)checkRotateBounds;
- (void)undoRotateMatrix:(CCArray*)originalPositions;
- (void)checkForWin;
- (void)moveFieldDown:(NSMutableArray *)tags;
- (void)gameOver;
- (void)checkMove;
- (void)reset:(id)sender;
- (void)setLevel:(NSUInteger)lvl speed:(NSUInteger)drop;
- (void)resumeGame;
- (NSString *)levelCompleteAchivement;
- (void)commitAchivement:(NSString *)achivement;
- (void)commitScore;

@end
