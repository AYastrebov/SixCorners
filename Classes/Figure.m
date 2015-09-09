//
//  Figure.m
//  HexTetris
//
//  Created by Andrey Yastrebov on 16.10.10.
//  Copyright 2010 overboldapps. All rights reserved.
//

#import "Figure.h"
#import "SkinsManager.h"

@implementation Figure
@synthesize block1, block2, block3, block4, figurePoints, fType, rotationPoint;

- (id) initWithLocation:(CGPoint)spawnPoint Figuretype:(int)type offSet:(CGPoint)offS
{
	if( (self=[super init] )) 
	{
		figuresPath = [SkinsManager figuresPath];
		
		if (type == kFigure1) 
		{
			self.fType = kFigure1;
			[self figureWithTexture:[NSString stringWithFormat:@"%@/%@",figuresPath ,@"hex_1.png"]];

			self.block1.position = ccp(spawnPoint.x, spawnPoint.y + offS.y);;
			self.block2.position = spawnPoint;
			self.block3.position = ccp(spawnPoint.x, block2.position.y - offS.y);
			self.block4.position = ccp(spawnPoint.x, block3.position.y - offS.y);
		}
		
		if (type == kFigure2) 
		{
			self.fType = kFigure2;
			[self figureWithTexture:[NSString stringWithFormat:@"%@/%@",figuresPath ,@"hex_2.png"]];
			
			self.block1.position = ccp(spawnPoint.x, spawnPoint.y + offS.y);;
			self.block2.position = spawnPoint;
			self.block3.position = ccp(spawnPoint.x - offS.x, block2.position.y - offS.y/2);
			self.block4.position = ccp(spawnPoint.x + offS.x, block2.position.y - offS.y/2);
		}
		
		if (type == kFigure3) 
		{
			self.fType = kFigure3;
			[self figureWithTexture:[NSString stringWithFormat:@"%@/%@",figuresPath ,@"hex_3.png"]];
			
			self.block1.position = ccp(spawnPoint.x, spawnPoint.y + offS.y);;
			self.block2.position = spawnPoint;
			self.block3.position = ccp(spawnPoint.x, block2.position.y - offS.y);
			self.block4.position = ccp(spawnPoint.x + offS.x, block2.position.y - offS.y/2);
		}
		
		if (type == kFigure4) 
		{
			self.fType = kFigure4;
			[self figureWithTexture:[NSString stringWithFormat:@"%@/%@",figuresPath ,@"hex_4.png"]];
			
			self.block1.position = ccp(spawnPoint.x, spawnPoint.y + offS.y);
			self.block2.position = spawnPoint;
			self.block3.position = ccp(spawnPoint.x, block2.position.y - offS.y);
			self.block4.position = ccp(spawnPoint.x - offS.x, block2.position.y - offS.y/2);
		}
		
		
		if (type == kFigure5) 
		{
			self.fType = kFigure5;
			[self figureWithTexture:[NSString stringWithFormat:@"%@/%@",figuresPath ,@"hex_5.png"]];
			
			self.block1.position = ccp(spawnPoint.x, spawnPoint.y + offS.y);
			self.block2.position = spawnPoint;
			self.block3.position = ccp(spawnPoint.x - offS.x, block2.position.y - offS.y/2);
			self.block4.position = ccp(spawnPoint.x - offS.x, block3.position.y - offS.y);
		}
		
		if (type == kFigure6) 
		{
			self.fType = kFigure6;
			[self figureWithTexture:[NSString stringWithFormat:@"%@/%@",figuresPath ,@"hex_6.png"]];
			
			self.block1.position = ccp(spawnPoint.x, spawnPoint.y + offS.y);
			self.block2.position = spawnPoint;
			self.block3.position = ccp(spawnPoint.x + offS.x, block2.position.y - offS.y/2);
			self.block4.position = ccp(spawnPoint.x + offS.x, block3.position.y - offS.y);
		}
		
		if (type == kFigure7) 
		{
			self.fType = kFigure7;
			[self figureWithTexture:[NSString stringWithFormat:@"%@/%@",figuresPath ,@"hex_7.png"]];
			self.block1.position = ccp(spawnPoint.x, spawnPoint.y + 2*offS.y);
			self.block2.position = ccp(spawnPoint.x, spawnPoint.y + offS.y);
			self.block3.position = spawnPoint;
			self.block4.position = ccp(spawnPoint.x + offS.x, block3.position.y - offS.y/2);
		}
		
		if (type == kFigure8) 
		{
			self.fType = kFigure8;
			[self figureWithTexture:[NSString stringWithFormat:@"%@/%@",figuresPath ,@"hex_8.png"]];
			self.block1.position = ccp(spawnPoint.x, spawnPoint.y + 2*offS.y);
			self.block2.position = ccp(spawnPoint.x, spawnPoint.y + offS.y);
			self.block3.position = spawnPoint;
			self.block4.position = ccp(spawnPoint.x - offS.x, block3.position.y - offS.y/2);
		}
		
		if (type == kFigure9) 
		{
			self.fType = kFigure9;
			[self figureWithTexture:[NSString stringWithFormat:@"%@/%@",figuresPath ,@"hex_9.png"]];
			
			self.block1.position = ccp(spawnPoint.x, spawnPoint.y + offS.y);
			self.block2.position = ccp(spawnPoint.x - offS.x, spawnPoint.y + offS.y/2);
			self.block3.position = ccp(spawnPoint.x + offS.x, spawnPoint.y + offS.y/2);
			self.block4.position = ccp(block3.position.x, block3.position.y - offS.y);
		}
		
		if (type == kFigure10) 
		{
			self.fType = kFigure10;
			[self figureWithTexture:[NSString stringWithFormat:@"%@/%@",figuresPath ,@"hex_10.png"]];
			
			self.block1.position = ccp(spawnPoint.x, spawnPoint.y + offS.y);
			self.block2.position = spawnPoint;
			self.block3.position = ccp(spawnPoint.x + offS.x, spawnPoint.y + offS.y/2);
			self.block4.position = ccp(block3.position.x, block3.position.y - offS.y);
		}
		
		if (type == kTestFigure) 
		{
			self.fType = kTestFigure;
			[self figureWithTexture:[NSString stringWithFormat:@"%@/%@",figuresPath ,@"hex_1.png"]];
			
			self.block1.position = ccp(spawnPoint.x, spawnPoint.y + offS.y);
			self.block2.position = spawnPoint;
			self.block3.position = CGPointZero;
			self.block4.position = CGPointZero;
		}
		[self updateFigurePoints];
		[self addChild:block1];
		[self addChild:block2];
		[self addChild:block3];
		[self addChild:block4];
	}
	return self;
}

- (void)figureWithTexture:(NSString* )texture
{
	self.block1 = [CCSprite spriteWithFile:texture];
	self.block2 = [CCSprite spriteWithFile:texture];
	self.block3 = [CCSprite spriteWithFile:texture];
	self.block4 = [CCSprite spriteWithFile:texture];
}

- (void)updateFigurePoints
{
	figurePoints = [self pointsArray];
}

- (CCArray* )pointsArray
{
	CCArray *points = [[CCArray alloc] init];
	NSValue *pos;// = [[NSValue alloc] init];
	
	pos = [NSValue valueWithCGPoint:block1.position];
	[points addObject:pos];
	
	pos = [NSValue valueWithCGPoint:block2.position];
	[points addObject:pos];
	
	pos = [NSValue valueWithCGPoint:block3.position];
	[points addObject:pos];
	
	pos = [NSValue valueWithCGPoint:block4.position];
	[points addObject:pos];

	return points;
}

- (void)dealloc
{
	self.block1 = nil;
	self.block2 = nil;
	self.block3 = nil;
	self.block4 = nil;
	self.figurePoints =nil;
	[super dealloc];
}

@end
