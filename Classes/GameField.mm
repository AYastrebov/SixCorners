//
//  GameField.m
//  6Corners
//
//  Created by Andrey Yastrebov on 2/8/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "GameField.h"
#import "Figure.h"
#import "SectionArray.h"
#import "Hex.h"
#import "AbstractField.h"
#import "GlobalSettings.h"
#import "MenuScene.h"
#import "Audio.h"
#import "WinLoseScene.h"
#import "PauseScene.h"
#import "SkinsManager.h"

@implementation GameField
@synthesize hexMap, emitter, level, pauseButton, isEndlessMode, endlessModeSpeed;

+ (id) scene
{
	// 'scene' is an autorelease object.
	CCScene *scene = [CCScene node];
	
	// 'layer' is an autorelease object.
	GameField *layer = [GameField node];
	
	// add layer as a child to scene
	[scene addChild: layer];
	
	// return the scene
	return scene;
}

#pragma mark -
#pragma mark Initialization
// on "init" you need to initialize your instance
- (id) init
{
	// always call "super" init
	// Apple recommends to re-assign "self" with the "super" return value
	if( (self=[super init] )) 
	{
		
		self.isTouchEnabled = YES;
		CGSize winSize = [[CCDirector sharedDirector] winSize];
		
		gameFieldPath = [SkinsManager gameFieldPath];
		figuresPath = [SkinsManager figuresPath];
		
		//background
		CCSprite *background = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"background.png"]];
		[background setPosition:ccp(winSize.width/2, winSize.height/2)];
		[self addChild:background z:-1];
		
		//HexMap
		self.hexMap = [CCTMXTiledMap tiledMapWithTMXFile:[NSString stringWithFormat:@"hexmap_iphone_%d.tmx", [SkinsManager currentSkin]]];
		self.hexMap.position = ccp(0, 0);
		
		[self addChild:hexMap z:0];
		
		CCTMXObjectGroup *objects = [hexMap objectGroupNamed:@"ObjectGroup"];
		NSAssert(objects != nil, @"'ObjectGroup' object group not found");
		NSMutableDictionary *spawnPoint = [objects objectNamed:@"Figure"];        
		NSAssert(spawnPoint != nil, @"SpawnPoint object not found");
		int x = [[spawnPoint valueForKey:@"x"] intValue];
		int y = [[spawnPoint valueForKey:@"y"] intValue];
		
		settings = [[GlobalSettings alloc] initWithHexMap:self.hexMap];
		
		xOffset = [settings offSet].x;
		yOffset = [settings offSet].y;
				
		respawn = ccp(x, y);
		
		current = arc4random() % 10;
		fastFigureMove = NO;
		dropInterval = 2.f;
		
		[self spawnFigure];
		
		abstractHexMap = [AbstractField createAbstractField:self.hexMap];
		
		pauseButton = [CCMenuItemImage 
					   itemFromNormalImage:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"pause.png"] 
					   selectedImage:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"pause2.png"]
					   target:self 
					   selector:@selector(pauseButtonPressed:)];
		
		CCMenu *buttonsMenu = [CCMenu menuWithItems:pauseButton, nil];
		buttonsMenu.position = ccp(278, winSize.height/6);
		
		[self addChild:buttonsMenu];
		
		CCSprite *scoreSprite = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"score_label.png"]];
		CCSprite *linesSprite = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"lines_label.png"]];
		CCSprite *levelSprite = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"level_label.png"]];
		CCSprite *arrow = [CCSprite spriteWithFile:[NSString stringWithFormat:@"%@/%@",gameFieldPath ,@"arrow.png"]];
		scoreSprite.position = ccp(275, winSize.height - 20);
		linesSprite.position = ccp(275, winSize.height - 70);
		levelSprite.position = ccp(275, winSize.height - 120);
		arrow.position = ccp(275, winSize.height/2 - 65);
		[self addChild:scoreSprite];
		[self addChild:linesSprite];
		[self addChild:levelSprite];
		[self addChild:arrow];
		
		scoreLabel = [[CCLabelBMFont labelWithString:@"0" fntFile:@"arcade.fnt"] retain];
		scoreLabel.position = ccp(275, winSize.height - 50);
		[self addChild:scoreLabel];
		
		linesLabel = [[CCLabelBMFont labelWithString:@"0" fntFile:@"arcade.fnt"] retain];
		linesLabel.position = ccp(275, winSize.height - 100);
		[self addChild:linesLabel];
		
		levelLabel = [[CCLabelBMFont labelWithString:@"0" fntFile:@"arcade.fnt"] retain];
		levelLabel.position = ccp(275, winSize.height - 150);
		[self addChild:levelLabel];
		
		hexes = [AbstractField hexesArray:abstractHexMap ignoreFilled:NO];
		winHexes = [AbstractField winRowsArray:hexes];
		
		self.emitter = [CCParticleSystemQuad particleWithFile:@"destroy.plist"];
		[self.emitter setVisible:NO];
		[self addChild:emitter];
		
		pauseScene = [[PauseScene alloc] initWithGameScene:self];
		
		gameOver = NO;
		
		[self reset:nil];
		[audioInGame playBackgroundMusic:nil];
		
		[self schedule:@selector(timer:) interval:1.f];
		
		[self commitAchivement:@"855552"];
		
	}
	return self;
}

- (void)timer:(ccTime)dt
{
	timeCount++;
	if (timeCount > audioInGame.duration) 
	{
		[audioInGame nextTrack:nil];
		timeCount = 0;
	}
}

- (void)pauseButtonPressed:(id)sender
{
	[[CCDirector sharedDirector] pause];
	[pauseButton setIsEnabled:NO];
	pauseScene.position = ccp(160, 240);
	[self addChild:pauseScene z:4 tag:350];
	[audioInGame pause];
}

#pragma mark -
#pragma mark Level selection

- (void)setLevel:(NSUInteger)lvl speed:(NSUInteger)drop
{
	NSArray *levels = [NSArray arrayWithObjects:
					   [NSNumber numberWithFloat:2.25f],
					   [NSNumber numberWithFloat:2.f], 
					   [NSNumber numberWithFloat:1.75f],
					   [NSNumber numberWithFloat:1.5f],
					   [NSNumber numberWithFloat:1.25f],
					   [NSNumber numberWithFloat:1.f],
					   [NSNumber numberWithFloat:.75f],
					   [NSNumber numberWithFloat:.5f],
					   [NSNumber numberWithFloat:.25f],
					   [NSNumber numberWithFloat:.2f],
					   nil];
	
	if ((lvl <= 9) && (lvl >= 0)) 
	{
		isEndlessMode = NO;
		dropInterval = [[levels objectAtIndex:lvl] floatValue];
		[self unschedule:@selector(moveFigureDown:)];
		[self schedule:@selector(moveFigureDown:) interval:dropInterval];
		
		level = lvl + 1;
		[levelLabel setString:[NSString stringWithFormat:@"%d", level]];
	}
	else 
	{
		if (lvl == 10) 
		{
			isEndlessMode = YES;
			[self unschedule:@selector(moveFigureDown:)];
			[self schedule:@selector(moveFigureDown:) 
				  interval:[[levels objectAtIndex:drop] floatValue]];
			
			level = lvl + 1;
			endlessModeSpeed = drop;
			[levelLabel setString:[NSString stringWithFormat:@"%d", drop + 1]];
		}
	}

}

#pragma mark -
#pragma mark HighScores and achivements submition

- (NSString *)levelCompleteAchivement
{
	NSString *achivement;
	
	switch (level)
	{
		case 1:
			NSLog (@"first level");
			achivement = @"855562";
			break;
		case 2:
			NSLog (@"second level");
			achivement = @"855572";
			break;
		case 3:
			NSLog (@"third level");
			achivement = @"855582";
			break;
		case 4:
			NSLog (@"fougth level");
			achivement = @"855592";
			break;
		case 5:
			NSLog (@"level 5");
			achivement = @"855602";
			break;
		case 6:
			NSLog (@"level 6");
			achivement = @"855612";
		case 7:
			NSLog (@"level 7");
			achivement = @"855622";
			break;
		case 8:
			NSLog (@"level 8");
			achivement = @"855632";
			break;
		case 9:
			NSLog (@"level 9");
			achivement = @"855642";
			break;
		case 10:
			NSLog (@"level 10");
			achivement = @"855652";
		default:
			NSLog (@"XYNTA");
			achivement = nil;
			break;
	}

	return achivement;
}

- (void)commitAchivement:(NSString *)achivement
{
}

- (void)commitScore
{
	NSString *leaderboard;
	
	switch (level)
	{
		case 1:
			NSLog (@"first level");
			leaderboard = @"664856";
			break;
		case 2:
			NSLog (@"second level");
			leaderboard = @"664866";
			break;
		case 3:
			NSLog (@"third level");
			leaderboard = @"664886";
			break;
		case 4:
			NSLog (@"fougth level");
			leaderboard = @"664896";
			break;
		case 5:
			NSLog (@"level 5");
			leaderboard = @"664906";
			break;
		case 6:
			NSLog (@"level 6");
			leaderboard = @"664916";
		case 7:
			NSLog (@"level 7");
			leaderboard = @"664926";
			break;
		case 8:
			NSLog (@"level 8");
			leaderboard = @"664936";
			break;
		case 9:
			NSLog (@"level 9");
			leaderboard = @"664946";
			break;
		case 10:
			NSLog (@"level 10");
			leaderboard = @"664956";
			break;
		case 11:
			NSLog (@"endless mode");
			leaderboard = @"664966";
		default:
			NSLog (@"XYNTA");
			break;
	}
	
}

#pragma mark -
#pragma mark Debug Methoods
- (void)showPos
{
	NSLog(@"block1: x:%f y:%f", [[blocksPositions objectAtIndex:0] CGPointValue].x, [[blocksPositions objectAtIndex:0] CGPointValue].y);
	NSLog(@"block2: x:%f y:%f", [[blocksPositions objectAtIndex:1] CGPointValue].x, [[blocksPositions objectAtIndex:1] CGPointValue].y);
	NSLog(@"block3: x:%f y:%f", [[blocksPositions objectAtIndex:2] CGPointValue].x, [[blocksPositions objectAtIndex:2] CGPointValue].y);
	NSLog(@"block4: x:%f y:%f", [[blocksPositions objectAtIndex:3] CGPointValue].x, [[blocksPositions objectAtIndex:3] CGPointValue].y);
}

- (void)showActualPos
{
	NSLog(@"Ablock1: x:%f y:%f", [[actualBlocksPositions objectAtIndex:0] CGPointValue].x, [[actualBlocksPositions objectAtIndex:0] CGPointValue].y);
	NSLog(@"Ablock2: x:%f y:%f", [[actualBlocksPositions objectAtIndex:1] CGPointValue].x, [[actualBlocksPositions objectAtIndex:1] CGPointValue].y);
	NSLog(@"Ablock3: x:%f y:%f", [[actualBlocksPositions objectAtIndex:2] CGPointValue].x, [[actualBlocksPositions objectAtIndex:2] CGPointValue].y);
	NSLog(@"Ablock4: x:%f y:%f", [[actualBlocksPositions objectAtIndex:3] CGPointValue].x, [[actualBlocksPositions objectAtIndex:3] CGPointValue].y);
}

#pragma mark -
#pragma mark Sound Management

- (void)reset:(id)sender 
{
	if (audioInGame) 
	{
		[audioInGame release];
	}
	audioInGame = [[Audio alloc] init];
}

#pragma mark -
#pragma mark Figure Management
- (void)spawnFigure
{

	if (fastFigureMove) 
	{
		fastFigureMove = NO;
		[self unschedule:@selector(moveFigureDown:)];
		[self schedule:@selector(moveFigureDown:) interval:dropInterval];
	}
	
	CGPoint offSet = ccp(xOffset, yOffset);
	
	if (!gameOver) 
	{
		NSUInteger next = arc4random() % 10;
		
		figure = [[Figure alloc] initWithLocation:CGPointZero Figuretype:current offSet:offSet];
		current = next;
		[self removeChildByTag:kNextFigureTag cleanup:YES];
		Figure *nextFigure = [[Figure alloc] initWithLocation:CGPointMake(275, 250) Figuretype:next offSet:offSet];
		nextFigure.tag = kNextFigureTag;
		[self addChild:nextFigure z:3 tag:kNextFigureTag];
		
		if ((figure.fType == kFigure7) || (figure.fType == kFigure8)) 
		{
			figure.position = ccp(respawn.x, respawn.y - yOffset);
		}
		else 
		{
			figure.position = respawn;
		}
		[self addChild:figure z:3 tag:0]; 
		
		blocksPositions = [figure pointsArray];
		[self recalcBlockPositions:blocksPositions];
		
		CCArray* blocks = [[CCArray alloc] initWithArray:[self children]];
		for (NSValue *value in actualBlocksPositions) 
		{
			CGPoint point = [value CGPointValue];
			for (CCSprite *block in blocks) 
			{
				if (block.tag >= 1 && block.tag <= 215) 
				{
					if (CGPointEqualToPoint(block.position, point) && !gameOver) 
					{
						gameOver = YES;
						[self gameOver];
						//[self removeChildByTag:0 cleanup:YES];
						break;
					}
				}
			}
		}
		[blocks release];
	}

}

- (void)freezeAndAddNew
{
	if (!gameOver) 
	{
		[self recalcBlockPositions:blocksPositions];
		NSMutableArray *freezedBlocks = [[NSMutableArray alloc] init];
		
		CCSprite* freezBlock1 = [CCSprite spriteWithFile:[NSString stringWithFormat:@"hex_freeze_%d.png", [SkinsManager currentSkin]]];
		freezBlock1.position = [[actualBlocksPositions objectAtIndex:0] CGPointValue];
		[freezedBlocks addObject:freezBlock1];
		
		CCSprite* freezBlock2 = [CCSprite spriteWithFile:[NSString stringWithFormat:@"hex_freeze_%d.png", [SkinsManager currentSkin]]];
		freezBlock2.position = [[actualBlocksPositions objectAtIndex:1] CGPointValue];
		[freezedBlocks addObject:freezBlock2];
		
		CCSprite* freezBlock3 = [CCSprite spriteWithFile:[NSString stringWithFormat:@"hex_freeze_%d.png", [SkinsManager currentSkin]]];
		freezBlock3.position = [[actualBlocksPositions objectAtIndex:2] CGPointValue];
		[freezedBlocks addObject:freezBlock3];
		
		CCSprite* freezBlock4 = [CCSprite spriteWithFile:[NSString stringWithFormat:@"hex_freeze_%d.png", [SkinsManager currentSkin]]];
		freezBlock4.position = [[actualBlocksPositions objectAtIndex:3] CGPointValue];
		[freezedBlocks addObject:freezBlock4];
		
		for (NSUInteger i=0; i < [abstractHexMap sectionsCount]; i++) 
		{
			for (NSUInteger j=0; j < [abstractHexMap rowsCount]; j++) 
			{
				for (int k=0; k<4; k++) 
				{
					Hex *hex = [abstractHexMap objectInSection:i row:j];
					
					if (!CGPointEqualToPoint(hex.positionPix, CGPointZero))
					{
						if (CGPointEqualToPoint([hex positionPix], 
												[[actualBlocksPositions objectAtIndex:k] CGPointValue])) 
						{
							for (CCSprite *block in freezedBlocks) 
							{
								if (CGPointEqualToPoint(hex.positionPix, block.position)) 
								{
									[hex setFilled:YES];
									block.tag = hex.tag;
								}
							}
						}
					}
				}
			}
		}
		
		for (CCSprite* block in freezedBlocks) 
		{
			[self addChild:block z:2];
		}
		[freezedBlocks release];
		[self removeChildByTag:0 cleanup:YES];
		[self checkForWin];
		[self spawnFigure];
	}
}

- (void)resumeGame
{
	[audioInGame resume];
	[[CCDirector sharedDirector] resume];
	[self removeChildByTag:350 cleanup:YES];
}

#pragma mark -
#pragma mark Calculation

- (void)recalcBlockPositions:(CCArray*)pointsToCalc
{		
	CCArray *recalcPoints = [[CCArray alloc] init];
	for (int i = 0; i < 4; i++) 
	{
		NSValue* value = [NSValue valueWithCGPoint:
						  [self CGPointAdd:figure.position 
									second:[[pointsToCalc objectAtIndex:i] CGPointValue]]];
		[recalcPoints addObject:value];
	}
	actualBlocksPositions = recalcPoints;
}

- (CGPoint)CGPointAdd:(CGPoint)a second:(CGPoint)b
{
	return CGPointMake(a.x+b.x, a.y+b.y);
}

#pragma mark -
#pragma mark WinLoose game checking

- (void)checkForWin
{
	CCArray* blocks = [[CCArray alloc] initWithArray:[self children]];
	
	BOOL checkNext = YES;
	
	SectionArray *tags = [AbstractField winTags:winHexes];
	[self recalcBlockPositions:blocksPositions];
	
	for (int i = 0; i < 19; i++) 
	{
		NSUInteger count = 0;
		NSMutableArray* tmp = [tags getRow:i];
		for (NSNumber *num in tmp) 
		{
			for (CCSprite *sprite in blocks) 
			{
				if (sprite.tag == [num integerValue]) 
				{
					count++;
					if (count == 11) 
					{
						for (NSNumber *num in tmp) 
						{
							[self removeChildByTag:[num integerValue] cleanup:YES];
						}
						linesCount++;
						[linesLabel setString:[NSString stringWithFormat:@"%d", linesCount]];
						[self moveFieldDown:tmp];
						checkNext = YES;
						
						if ((linesCount >= 9 + level) && (level <= 10)) 
						{
							winLose = [[WinLoseScene alloc] initWithResult:gameOver 
																	   score:scoreCount 
																	   lines:linesCount 
																	   level:level];
							winLose.position = ccp(160, 240);
							[self addChild:winLose z:4];
							[self unscheduleAllSelectors];
                            gameOver = YES;
                            self.isTouchEnabled = NO;
							[self commitScore];
							[self commitAchivement:[self levelCompleteAchivement]];
							[audioInGame stopMusic];
							[pauseButton setIsEnabled:NO];
						}
						else 
						{
							if ((linesCount >= 25) && (level == 11))
							{
								[self commitAchivement:@"855662"];
							}
						}
					}
					else 
					{
						checkNext = NO;
					}
					if (checkNext) 
					{
						[self checkForWin];
					}

				}
			}
		}
	}
	[blocks release];
}

- (void)gameOver
{
	winLose = [[WinLoseScene alloc] initWithResult:gameOver 
											  score:scoreCount 
											  lines:linesCount 
											  level:level];
	winLose.position = ccp(160, 240);
	[self addChild:winLose z:4];
	[self commitScore];
	[audioInGame stopMusic];
	[pauseButton setIsEnabled:NO];
    self.isTouchEnabled = NO;
}

- (void)moveFieldDown:(NSMutableArray *)tags
{
	NSMutableArray *tagsArray = tags;
	
	CCArray* blocks = [[CCArray alloc] initWithArray:[self children]];
	CGPoint point;
	
	for (NSUInteger i=0; i < [abstractHexMap sectionsCount]; i++) 
	{
		for (NSUInteger j=0; j < [abstractHexMap rowsCount]; j++) 
		{
			Hex *hex = [abstractHexMap objectInSection:i row:j];
			if (hex.tag == (unsigned)[[tagsArray objectAtIndex:0] integerValue]) 
			{
				point = hex.positionPix;
				self.emitter.position = ccp(self.hexMap.contentSize.width/2 - 35, point.y);
				[self.emitter setVisible:YES];
				[self.emitter resetSystem];
			}
		}
	}
	
	for (CCSprite *block in blocks) 
	{
		if (block.tag >= 1 && block.tag <= 215) 
		{
			if (block.position.y > point.y) 
			{
				block.position = ccp(block.position.x, block.position.y - yOffset);
			}
		}
	}
	
	for (CCSprite *block in blocks) 
	{
		if (block.tag >= 1 && block.tag <= 215) 
		{
			for (NSUInteger i=0; i < [abstractHexMap sectionsCount]; i++) 
			{
				for (NSUInteger j=0; j < [abstractHexMap rowsCount]; j++) 
				{
					Hex *hex = [abstractHexMap objectInSection:i row:j];
					if (CGPointEqualToPoint(hex.positionPix, block.position)) 
					{
						block.tag = hex.tag;
						[hex setFilled:YES];
					}
					else 
					{
						[hex setFilled:NO];
					}
					
				}
			}
			
		}
	}
	[blocks release];
}

#pragma mark -
#pragma mark Bounds Checking

- (void)checkNeighbours:(NSUInteger)moveType
{
	CCArray* blocks = [[CCArray alloc] initWithArray:[self children]];
	
	for (CCSprite* block in blocks) 
	{ 
		for (NSValue* value in actualBlocksPositions)
		{
			if (CGPointEqualToPoint([value CGPointValue], block.position) && block.tag > 0) 
			{
				if (moveType == kDownMove) 
				{
					[self moveFigureUp:nil];
					[self freezeAndAddNew];
				}
				if (moveType == kLeftMove) 
				{
					isRightBound = NO;
					[self moveFigureRight:nil];
				}
				if (moveType == kRightMove) 
				{
					isLeftBound = NO;
					[self moveFigureLeft:nil];
				}
			}
		}
	}
	[blocks release];
}

- (BOOL)isRotateAllowed
{	
	CCArray* blocksPosBeforeRot = [[CCArray alloc] initWithArray:blocksPositions];
	[self applyRotateMatrix];
	
	CCArray* blocks = [[CCArray alloc] initWithArray:[self children]];
	
	canRotate = YES;
	for (CCSprite* block in blocks) 
	{ 
		for (NSValue* value in actualBlocksPositions)
		{
			if (CGPointEqualToPoint([value CGPointValue], block.position) && block.tag > 0) 
			{
				[self undoRotateMatrix:blocksPosBeforeRot];
				canRotate = NO;
			}
		}
	}
	[blocks release];
	[blocksPosBeforeRot release];
	
	return canRotate;
}

- (void)checkRotateBounds
{	
	if ([self isRotateAllowed]) 
	{
		//checking left bound
		CGPoint lTmp = CGPointZero;
		int offSetNum = 0;
		for (int k=0; k<4; k++) 
		{
			CGPoint measurePoint = [[actualBlocksPositions objectAtIndex:k] CGPointValue];
			if ([[abstractHexMap objectInSection:0 row:0] positionPix].x > measurePoint.x) 
			{
				offSetNum++;
				if (offSetNum == 1) 
				{
					lTmp = ccp(figure.position.x + offSetNum*xOffset, figure.position.y + yOffset/2);
				}
				else 
				{
					lTmp = ccp(figure.position.x + offSetNum*xOffset, figure.position.y);
				}
			}
		}
		
		if (!(CGPointEqualToPoint(lTmp, CGPointZero))) 
		{
			figure.position = lTmp;
		}
		
		//checkin right bound
		CGPoint rTmp = CGPointZero;
		offSetNum = 0;
		for (int k=0; k<4; k++) 
		{
			CGPoint measurePoint = [[actualBlocksPositions objectAtIndex:k] CGPointValue];
			if ([[abstractHexMap objectInSection:[abstractHexMap sectionsCount]-1 row:[abstractHexMap rowsCount]-1] positionPix].x < measurePoint.x) 
			{
				offSetNum++;
				if (offSetNum == 1) 
				{
					rTmp = ccp(figure.position.x - offSetNum*xOffset, figure.position.y + yOffset/2);
				}
				else 
				{
					rTmp = ccp(figure.position.x - offSetNum*xOffset, figure.position.y);
				}
			}
		}
		
		if (!(CGPointEqualToPoint(rTmp, CGPointZero))) 
		{
			figure.position = rTmp;
		}
		
		[self recalcBlockPositions:blocksPositions];
		[self checkBounds:nil];
	}
}

- (void)checkBounds:(id)sender
{	
	//checking left bound
	isLeftBound = NO;
	for (NSUInteger i=0; i < [abstractHexMap rowsCount]; i++) 
	{
		for (int k=0; k<4; k++) 
		{
			if (CGPointEqualToPoint([[abstractHexMap objectInSection:0 row:i] positionPix], 
									[[actualBlocksPositions objectAtIndex:k] CGPointValue])) 
			{
				isLeftBound = YES;
				break;
			}
		}
	}
	
	//checking right bound
	isRightBound = NO;
	for (NSUInteger i=0; i < [abstractHexMap rowsCount]; i++) 
	{
		for (int k=0; k<4; k++) 
		{
			if (CGPointEqualToPoint([[abstractHexMap objectInSection:[abstractHexMap sectionsCount]-1 row:i] positionPix], 
									[[actualBlocksPositions objectAtIndex:k] CGPointValue])) 
			{
				isRightBound = YES;
				break;
			}
		}
	}
	
	//checking lower bound
	BOOL spawnNewFigure = NO;
	for (NSUInteger j=0; j < [abstractHexMap sectionsCount]; j++) 
	{
		for (int k=0; k<4; k++) 
		{
			if ((CGPointEqualToPoint([[abstractHexMap objectInSection:j row:0] positionPix], 
									 [[actualBlocksPositions objectAtIndex:k] CGPointValue])) && (!spawnNewFigure)) 
			{
				spawnNewFigure = YES;
				break;
			}
		}
	}
	
	if (spawnNewFigure) 
	{
		spawnNewFigure = NO;
		[self freezeAndAddNew];
	}
}

#pragma mark -
#pragma mark Figure Movement
- (void)moveFigureUp:(id)sender
{
	figure.position = ccp(figure.position.x, figure.position.y + [settings tileSize].height);
	[self recalcBlockPositions:blocksPositions];
}

- (void)moveFigureDown:(id)sender
{	
	if (!gameOver) 
	{
		figure.position = ccp(figure.position.x, figure.position.y - [settings tileSize].height);
		[self recalcBlockPositions:blocksPositions];
		[self checkNeighbours:kDownMove];
		[self checkBounds:nil];
		
		if (fastFigureMove) 
		{
			scoreCount++;
			[scoreLabel setString:[NSString stringWithFormat:@"%d", scoreCount]];
		}
	}
}

- (void)fastMoveFigureDown:(id)sender
{
}

- (void)moveFigureLeft:(id)sender
{
	if (!isLeftBound) 
	{
		if (upDown) 
		{
			figure.position = ccp(figure.position.x - xOffset, figure.position.y + yOffset/2);
			upDown = NO;
		}
		else 
		{
			figure.position = ccp(figure.position.x - xOffset, figure.position.y - yOffset/2);
			upDown = YES;
		}
	}
	[self recalcBlockPositions:blocksPositions];
	[self checkNeighbours:kLeftMove];
	[self checkBounds:nil];
}

- (void)moveFigureRight:(id)sender
{
	if (!isRightBound) 
	{
		if (upDown) 
		{
			figure.position = ccp(figure.position.x + xOffset, figure.position.y + yOffset/2);
			upDown = NO;
		}
		else 
		{
			figure.position = ccp(figure.position.x + xOffset, figure.position.y - yOffset/2);
			upDown = YES;
		}
	}
	[self recalcBlockPositions:blocksPositions];
	[self checkNeighbours:kRightMove];
	[self checkBounds:nil];
}

- (void)rotateFigure:(id)sender
{
	[self checkRotateBounds];
	if (canRotate) 
	{
		id actionTo = [CCRotateBy actionWithDuration:0.f angle:-60];
		id actionMoveDone = [CCCallFuncN actionWithTarget:self 
												 selector:@selector(figureRotateFinished:)];
		rotateAction = [CCSequence actions:actionTo, actionMoveDone, nil];
		[figure runAction:rotateAction];
	}
}

- (void)figureRotateFinished:(id)sender
{
	[figure stopAction:rotateAction];
}

- (void)applyRotateMatrix
{
	CCArray* pointsAfterRotation = [[CCArray alloc] init];
	
	for (NSValue* value in blocksPositions) 
	{
		CGPoint tmp = [value CGPointValue];
		if ((tmp.x != 0) || (tmp.y != 0)) 
		{
			CGPoint newLoc;
			newLoc.x = round((tmp.x * cos(degreesToRadian(60)) - tmp.y * sin(degreesToRadian(60))));
			newLoc.y = round((tmp.x * sin(degreesToRadian(60)) + tmp.y * cos(degreesToRadian(60))));
			[pointsAfterRotation addObject:[NSValue valueWithCGPoint:newLoc]];
		}
		else 
		{
			[pointsAfterRotation addObject:[NSValue valueWithCGPoint:CGPointZero]];
		}
	}
	blocksPositions = pointsAfterRotation;
	[self recalcBlockPositions:blocksPositions];
}

- (void)undoRotateMatrix:(CCArray*)originalPositions
{
	blocksPositions = [originalPositions retain];
	[self recalcBlockPositions:blocksPositions];
}

#pragma mark -
#pragma mark Touches

- (void)ccTouchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
	UITouch* touch = [touches anyObject];
	startMove = [touch locationInView:[touch view]];
}

- (void)ccTouchesEnded:(NSSet *)touches withEvent:(UIEvent *)event
{
	UITouch* touch = [touches anyObject];
	endMove = [touch locationInView:[touch view]];
	[self checkMove];
}

- (void)checkMove
{
	NSUInteger leftRightDist = 60;
	NSUInteger upDownDist = 60;
	
	if (fastFigureMove) 
	{
		fastFigureMove = NO;
		[self unschedule:@selector(moveFigureDown:)];
		[self schedule:@selector(moveFigureDown:) interval:dropInterval];
	}
	
	if ((endMove.x - startMove.x) > leftRightDist) 
	{
		[self moveFigureRight:nil];
	}
	else 
	{
		if ((startMove.x - endMove.x) > leftRightDist) 
		{
			[self moveFigureLeft:nil];
		}
		else 
		{
			if ((endMove.y - startMove.y) > upDownDist) 
			{
				fastFigureMove = YES;
				[self unschedule:@selector(moveFigureDown:)];
				[self schedule:@selector(moveFigureDown:) interval:.05f];
			}
			else 
			{
				CGRect rect = CGRectMake(figure.position.x - 60, figure.position.y - 60, 120, 120);
				CGPoint s = ccp(startMove.x, 480 - startMove.y);
				CGPoint e = ccp(endMove.x, 480 - endMove.y);
								
				if (CGRectContainsPoint(rect, s) && CGRectContainsPoint(rect, e)) 
				{
					[self rotateFigure:nil];
				}
			}
		}
	}
}

#pragma mark -
#pragma mark Memory Management
- (void) dealloc
{
	self.hexMap = nil;
	self.emitter = nil;
	self.pauseButton = nil;
	[figure release];
	[abstractHexMap release];
	[blocksPositions release];
	[actualBlocksPositions release];
	[settings release];
	[hexes release];
	[winHexes release];
	[audioInGame release];
	[scoreLabel release];
	[linesLabel release];
	[levelLabel release];
	[pauseScene release];
	[winLose release];
	[super dealloc];
}

@end
