//
//  Figure.h
//  HexTetris
//
//  Created by Andrey Yastrebov on 16.10.10.
//  Copyright 2010 overboldapps. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"

enum fTypes {
	kFigure1,
	kFigure2,
	kFigure3,
	kFigure4,
	kFigure5,
	kFigure6,
	kFigure7,
	kFigure8,
	kFigure9,
	kFigure10,
	kTestFigure
};

@interface Figure : CCNode 
{
	CCSprite *block1;
	CCSprite *block2;
	CCSprite *block3;
	CCSprite *block4;
	CCArray *figurePoints;
	int fType;
	NSString *figuresPath;
}
- (id) initWithLocation:(CGPoint)spawnPoint Figuretype:(int)type offSet:(CGPoint)offS;
- (void)figureWithTexture:(NSString* )texture;
- (CCArray* )pointsArray;
- (void)updateFigurePoints;

@property (nonatomic, retain) CCSprite *block1;
@property (nonatomic, retain) CCSprite *block2;
@property (nonatomic, retain) CCSprite *block3;
@property (nonatomic, retain) CCSprite *block4;
@property (nonatomic, retain) CCArray *figurePoints;
@property int fType;
@property CGPoint rotationPoint;

@end
