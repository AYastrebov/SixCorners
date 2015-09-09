//
//  AbstractField.m
//  6Corners
//
//  Created by Andrey Yastrebov on 2/12/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "AbstractField.h"
#import "SectionArray.h"
#import "Hex.h"
#import "GlobalSettings.h"

@implementation AbstractField

+ (NSArray *)tagsArray
{
	NSMutableArray *numbers = [[NSMutableArray alloc] init];
	for (int i = 1; i <= 215; i++) 
	{
		[numbers addObject:[NSNumber numberWithInt:i]];
	}
	return [NSArray arrayWithArray:numbers];
}

+ (SectionArray *)createAbstractField:(CCTMXTiledMap *)hexMap
{
	SectionArray *aPlaces = [[SectionArray alloc] initWithSections:6 rows:hexMap.mapSize.height];
	SectionArray *bPlaces = [[SectionArray alloc] initWithSections:5 rows:hexMap.mapSize.height];
	SectionArray *allPlaces = [[SectionArray alloc] initWithSections:hexMap.mapSize.width rows:hexMap.mapSize.height];
	
	int xCoord[[aPlaces sectionsCount]];
	int yCoord[[aPlaces rowsCount]];
	
	GlobalSettings *settings = [[GlobalSettings alloc] initWithHexMap:hexMap];
	
	int xOffset = [settings offSet].x;
	int yOffset = [settings offSet].y;
	
	int newXOff = [settings tileSize].width/2;
	
	for (int i = 0; i < [aPlaces sectionsCount]; i++) 
	{
		xCoord[i] = newXOff;
		newXOff += 2*xOffset;
	}
	
	int newYOff = [settings tileSize].height/2;
	
	for (int i = 0; i < [aPlaces rowsCount]; i++) 
	{
		yCoord[i] = newYOff;
		newYOff += yOffset;
	}
	
	for (int i = 0; i < [aPlaces sectionsCount]; i++) 
	{
		for (int j = 0; j < [aPlaces rowsCount]; j++)
		{
			[aPlaces insertObject:[[Hex alloc] initWithLocation:
								   CGPointMake(xCoord[i], yCoord[j])] inSection:i row:j];
			
		}
	}
	
	newXOff = [settings tileSize].width/2 + xOffset;
	
	for (int i = 0; i < [bPlaces sectionsCount]; i++) 
	{
		if (i != 19) 
		{
			xCoord[i] = newXOff;
			newXOff += 2*xOffset;
		}
	}
	
	newYOff = [settings tileSize].height;
	
	for (int i = 0; i < [bPlaces rowsCount]; i++) 
	{
		yCoord[i] = newYOff;
		newYOff += yOffset;
	}
	
	for (int i = 0; i < [bPlaces sectionsCount]; i++) 
	{
		for (int j = 0; j < [bPlaces rowsCount]; j++)
		{
			if (j != 19) 
			{
				[bPlaces insertObject:[[Hex alloc] initWithLocation:
									   CGPointMake(xCoord[i], yCoord[j])] inSection:i row:j];
			}
			else 
			{
				[bPlaces insertObject:[[Hex alloc] initWithLocation:
									   CGPointZero] inSection:i row:j];
			}
			
		}
	}
	
	int k = 0;
	for (int i = 0; i < [allPlaces sectionsCount]; i += 2) 
	{
		
		[allPlaces replaceRow:[aPlaces getRow:k] atIndex:i];
		if (k != 5) 
		{
			[allPlaces replaceRow:[bPlaces getRow:k] atIndex:i+1];
		}
		k++;
	}
	
	NSEnumerator *enumerator = [[self tagsArray] objectEnumerator];
	for (int i = 0; i < [allPlaces sectionsCount]; i++) 
	{
		for (int j = 0; j < [allPlaces rowsCount]; j++)
		{
			Hex *hex = [allPlaces objectInSection:i row:j];
			if (!CGPointEqualToPoint(hex.positionPix, CGPointZero)) 
			{
				hex.positionMap = CGPointMake(i, j);
				hex.isFilled = NO;
				hex.tag = [[enumerator nextObject] intValue];
			}
			else 
			{
				hex.isFilled = YES;
			}
		}
	}
	
	[aPlaces release];
	[bPlaces release];
	[settings release];
	
	return allPlaces;
}

+ (CCArray *)hexesArray:(SectionArray *)field ignoreFilled:(BOOL)b
{
	CCArray *hexesArray = [[CCArray alloc] init];
	
	for (int i = 0; i < [field sectionsCount]; i++) 
	{
		for (int j = 0; j < [field rowsCount]; j++)
		{
			Hex *hex = [field objectInSection:i row:j];
			if (!hex.isFilled) 
			{
				[hexesArray addObject:hex];
			}
			else 
			{
				if (b) 
				{
					[hexesArray addObject:hex];
				}
			}

		}
	}
	return hexesArray;
}

+ (CCArray *)winRowsArray:(CCArray *)hexes
{
	NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
	
	CCArray *row_1 = [[[CCArray alloc] init] autorelease];
	CCArray *row_2 = [[[CCArray alloc] init] autorelease];
	CCArray *row_3 = [[[CCArray alloc] init] autorelease];
	CCArray *row_4 = [[[CCArray alloc] init] autorelease];
	CCArray *row_5 = [[[CCArray alloc] init] autorelease];
	CCArray *row_6 = [[[CCArray alloc] init] autorelease];
	CCArray *row_7 = [[[CCArray alloc] init] autorelease];
	CCArray *row_8 = [[[CCArray alloc] init] autorelease];
	CCArray *row_9 = [[[CCArray alloc] init] autorelease];
	CCArray *row_10 = [[[CCArray alloc] init] autorelease];
	CCArray *row_11 = [[[CCArray alloc] init] autorelease];
	CCArray *row_12 = [[[CCArray alloc] init] autorelease];
	CCArray *row_13 = [[[CCArray alloc] init] autorelease];
	CCArray *row_14 = [[[CCArray alloc] init] autorelease];
	CCArray *row_15 = [[[CCArray alloc] init] autorelease];
	CCArray *row_16 = [[[CCArray alloc] init] autorelease];
	CCArray *row_17 = [[[CCArray alloc] init] autorelease];
	CCArray *row_18 = [[[CCArray alloc] init] autorelease];
	CCArray *row_19 = [[[CCArray alloc] init] autorelease];
    
	for (Hex *hex in hexes) 
	{
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 0))) 
		{
			[row_1 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 1))) 
		{
			[row_2 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 2))) 
		{
			[row_3 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 3))) 
		{
			[row_4 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x ,4))) 
		{
			[row_5 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 5))) 
		{
			[row_6 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 6))) 
		{
			[row_7 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 7))) 
		{
			[row_8 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 8))) 
		{
			[row_9 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 9))) 
		{
			[row_10 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 10))) 
		{
			[row_11 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 11))) 
		{
			[row_12 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 12))) 
		{
			[row_13 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 13))) 
		{
			[row_14 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 14))) 
		{
			[row_15 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 15))) 
		{
			[row_16 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 16))) 
		{
			[row_17 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 17))) 
		{
			[row_18 addObject:hex];
		}
		if (CGPointEqualToPoint(hex.positionMap, CGPointMake(hex.positionMap.x, 18))) 
		{
			[row_19 addObject:hex];
		}
		
	}
    
    
    CCArray *row_20 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_2 objectAtIndex:0],
                                                         [row_1 objectAtIndex:1],
                                                         [row_2 objectAtIndex:2],
                                                         [row_1 objectAtIndex:3],
                                                         [row_2 objectAtIndex:4],
                                                         [row_1 objectAtIndex:5],
                                                         [row_2 objectAtIndex:6],
                                                         [row_1 objectAtIndex:7],
                                                         [row_2 objectAtIndex:8],
                                                         [row_1 objectAtIndex:9],
                                                         [row_2 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_21 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_3 objectAtIndex:0],
                                                         [row_2 objectAtIndex:1],
                                                         [row_3 objectAtIndex:2],
                                                         [row_2 objectAtIndex:3],
                                                         [row_3 objectAtIndex:4],
                                                         [row_2 objectAtIndex:5],
                                                         [row_3 objectAtIndex:6],
                                                         [row_2 objectAtIndex:7],
                                                         [row_3 objectAtIndex:8],
                                                         [row_2 objectAtIndex:9],
                                                         [row_3 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_22 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_4 objectAtIndex:0],
                                                         [row_3 objectAtIndex:1],
                                                         [row_4 objectAtIndex:2],
                                                         [row_3 objectAtIndex:3],
                                                         [row_4 objectAtIndex:4],
                                                         [row_3 objectAtIndex:5],
                                                         [row_4 objectAtIndex:6],
                                                         [row_3 objectAtIndex:7],
                                                         [row_4 objectAtIndex:8],
                                                         [row_3 objectAtIndex:9],
                                                         [row_4 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_23 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_5 objectAtIndex:0],
                                                         [row_4 objectAtIndex:1],
                                                         [row_5 objectAtIndex:2],
                                                         [row_4 objectAtIndex:3],
                                                         [row_5 objectAtIndex:4],
                                                         [row_4 objectAtIndex:5],
                                                         [row_5 objectAtIndex:6],
                                                         [row_4 objectAtIndex:7],
                                                         [row_5 objectAtIndex:8],
                                                         [row_4 objectAtIndex:9],
                                                         [row_5 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_24 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_6 objectAtIndex:0],
                                                         [row_5 objectAtIndex:1],
                                                         [row_6 objectAtIndex:2],
                                                         [row_5 objectAtIndex:3],
                                                         [row_6 objectAtIndex:4],
                                                         [row_5 objectAtIndex:5],
                                                         [row_6 objectAtIndex:6],
                                                         [row_5 objectAtIndex:7],
                                                         [row_6 objectAtIndex:8],
                                                         [row_5 objectAtIndex:9],
                                                         [row_6 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_25 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_7 objectAtIndex:0],
                                                         [row_6 objectAtIndex:1],
                                                         [row_7 objectAtIndex:2],
                                                         [row_6 objectAtIndex:3],
                                                         [row_7 objectAtIndex:4],
                                                         [row_6 objectAtIndex:5],
                                                         [row_7 objectAtIndex:6],
                                                         [row_6 objectAtIndex:7],
                                                         [row_7 objectAtIndex:8],
                                                         [row_6 objectAtIndex:9],
                                                         [row_7 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_26 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_8 objectAtIndex:0],
                                                         [row_7 objectAtIndex:1],
                                                         [row_8 objectAtIndex:2],
                                                         [row_7 objectAtIndex:3],
                                                         [row_8 objectAtIndex:4],
                                                         [row_7 objectAtIndex:5],
                                                         [row_8 objectAtIndex:6],
                                                         [row_7 objectAtIndex:7],
                                                         [row_8 objectAtIndex:8],
                                                         [row_7 objectAtIndex:9],
                                                         [row_8 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_27 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_9 objectAtIndex:0],
                                                         [row_8 objectAtIndex:1],
                                                         [row_9 objectAtIndex:2],
                                                         [row_8 objectAtIndex:3],
                                                         [row_9 objectAtIndex:4],
                                                         [row_8 objectAtIndex:5],
                                                         [row_9 objectAtIndex:6],
                                                         [row_8 objectAtIndex:7],
                                                         [row_9 objectAtIndex:8],
                                                         [row_8 objectAtIndex:9],
                                                         [row_9 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_28 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_10 objectAtIndex:0],
                                                         [row_9 objectAtIndex:1],
                                                         [row_10 objectAtIndex:2],
                                                         [row_9 objectAtIndex:3],
                                                         [row_10 objectAtIndex:4],
                                                         [row_9 objectAtIndex:5],
                                                         [row_10 objectAtIndex:6],
                                                         [row_9 objectAtIndex:7],
                                                         [row_10 objectAtIndex:8],
                                                         [row_9 objectAtIndex:9],
                                                         [row_10 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_29 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_11 objectAtIndex:0],
                                                         [row_10 objectAtIndex:1],
                                                         [row_11 objectAtIndex:2],
                                                         [row_10 objectAtIndex:3],
                                                         [row_11 objectAtIndex:4],
                                                         [row_10 objectAtIndex:5],
                                                         [row_11 objectAtIndex:6],
                                                         [row_10 objectAtIndex:7],
                                                         [row_11 objectAtIndex:8],
                                                         [row_10 objectAtIndex:9],
                                                         [row_11 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_30 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_12 objectAtIndex:0],
                                                         [row_11 objectAtIndex:1],
                                                         [row_12 objectAtIndex:2],
                                                         [row_11 objectAtIndex:3],
                                                         [row_12 objectAtIndex:4],
                                                         [row_11 objectAtIndex:5],
                                                         [row_12 objectAtIndex:6],
                                                         [row_11 objectAtIndex:7],
                                                         [row_12 objectAtIndex:8],
                                                         [row_11 objectAtIndex:9],
                                                         [row_12 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_31 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_13 objectAtIndex:0],
                                                         [row_12 objectAtIndex:1],
                                                         [row_13 objectAtIndex:2],
                                                         [row_12 objectAtIndex:3],
                                                         [row_13 objectAtIndex:4],
                                                         [row_12 objectAtIndex:5],
                                                         [row_13 objectAtIndex:6],
                                                         [row_12 objectAtIndex:7],
                                                         [row_13 objectAtIndex:8],
                                                         [row_12 objectAtIndex:9],
                                                         [row_13 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_32 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_14 objectAtIndex:0],
                                                         [row_13 objectAtIndex:1],
                                                         [row_14 objectAtIndex:2],
                                                         [row_13 objectAtIndex:3],
                                                         [row_14 objectAtIndex:4],
                                                         [row_13 objectAtIndex:5],
                                                         [row_14 objectAtIndex:6],
                                                         [row_13 objectAtIndex:7],
                                                         [row_14 objectAtIndex:8],
                                                         [row_13 objectAtIndex:9],
                                                         [row_14 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_33 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_15 objectAtIndex:0],
                                                         [row_14 objectAtIndex:1],
                                                         [row_15 objectAtIndex:2],
                                                         [row_14 objectAtIndex:3],
                                                         [row_15 objectAtIndex:4],
                                                         [row_14 objectAtIndex:5],
                                                         [row_15 objectAtIndex:6],
                                                         [row_14 objectAtIndex:7],
                                                         [row_15 objectAtIndex:8],
                                                         [row_14 objectAtIndex:9],
                                                         [row_15 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_34 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_16 objectAtIndex:0],
                                                         [row_15 objectAtIndex:1],
                                                         [row_16 objectAtIndex:2],
                                                         [row_15 objectAtIndex:3],
                                                         [row_16 objectAtIndex:4],
                                                         [row_15 objectAtIndex:5],
                                                         [row_16 objectAtIndex:6],
                                                         [row_15 objectAtIndex:7],
                                                         [row_16 objectAtIndex:8],
                                                         [row_15 objectAtIndex:9],
                                                         [row_16 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_35 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_17 objectAtIndex:0],
                                                         [row_16 objectAtIndex:1],
                                                         [row_17 objectAtIndex:2],
                                                         [row_16 objectAtIndex:3],
                                                         [row_17 objectAtIndex:4],
                                                         [row_16 objectAtIndex:5],
                                                         [row_17 objectAtIndex:6],
                                                         [row_16 objectAtIndex:7],
                                                         [row_17 objectAtIndex:8],
                                                         [row_16 objectAtIndex:9],
                                                         [row_17 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_36 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_18 objectAtIndex:0],
                                                         [row_17 objectAtIndex:1],
                                                         [row_18 objectAtIndex:2],
                                                         [row_17 objectAtIndex:3],
                                                         [row_18 objectAtIndex:4],
                                                         [row_17 objectAtIndex:5],
                                                         [row_18 objectAtIndex:6],
                                                         [row_17 objectAtIndex:7],
                                                         [row_18 objectAtIndex:8],
                                                         [row_17 objectAtIndex:9],
                                                         [row_18 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_37 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_19 objectAtIndex:0],
                                                         [row_18 objectAtIndex:1],
                                                         [row_19 objectAtIndex:2],
                                                         [row_18 objectAtIndex:3],
                                                         [row_19 objectAtIndex:4],
                                                         [row_18 objectAtIndex:5],
                                                         [row_19 objectAtIndex:6],
                                                         [row_18 objectAtIndex:7],
                                                         [row_19 objectAtIndex:8],
                                                         [row_18 objectAtIndex:9],
                                                         [row_19 objectAtIndex:10],
                                                         nil]] autorelease];
    
    CCArray *row_38 = [[[CCArray alloc] initWithNSArray:[NSArray arrayWithObjects:
                                                         [row_20 objectAtIndex:0],
                                                         [row_19 objectAtIndex:1],
                                                         [row_20 objectAtIndex:2],
                                                         [row_19 objectAtIndex:3],
                                                         [row_20 objectAtIndex:4],
                                                         [row_19 objectAtIndex:5],
                                                         [row_20 objectAtIndex:6],
                                                         [row_19 objectAtIndex:7],
                                                         [row_20 objectAtIndex:8],
                                                         [row_19 objectAtIndex:9],
                                                         [row_20 objectAtIndex:10],
                                                         nil]] autorelease];
	  
	CCArray *rowsArray = [[CCArray alloc] init];
	[rowsArray addObject:row_1];
	[rowsArray addObject:row_2];
	[rowsArray addObject:row_3];
	[rowsArray addObject:row_4];
	[rowsArray addObject:row_5];
	[rowsArray addObject:row_6];
	[rowsArray addObject:row_7];
	[rowsArray addObject:row_8];
	[rowsArray addObject:row_9];
	[rowsArray addObject:row_10];
	[rowsArray addObject:row_11];
	[rowsArray addObject:row_12];
	[rowsArray addObject:row_13];
	[rowsArray addObject:row_14];
	[rowsArray addObject:row_15];
	[rowsArray addObject:row_16];
	[rowsArray addObject:row_17];
	[rowsArray addObject:row_18];
	[rowsArray addObject:row_19];
    
    [rowsArray addObject:row_20];
	[rowsArray addObject:row_21];
	[rowsArray addObject:row_22];
	[rowsArray addObject:row_23];
	[rowsArray addObject:row_24];
	[rowsArray addObject:row_25];
	[rowsArray addObject:row_26];
	[rowsArray addObject:row_27];
	[rowsArray addObject:row_28];
	[rowsArray addObject:row_29];
	[rowsArray addObject:row_30];
	[rowsArray addObject:row_31];
	[rowsArray addObject:row_32];
	[rowsArray addObject:row_33];
	[rowsArray addObject:row_34];
	[rowsArray addObject:row_35];
	[rowsArray addObject:row_36];
	[rowsArray addObject:row_37];
	[rowsArray addObject:row_38];
	
	[pool drain];
	return rowsArray;
}

+ (SectionArray *)winTags:(CCArray *)winHexes
{
	SectionArray *tags = [SectionArray sectionArrayWithSections:38 rows:11];
	
	NSUInteger count = 0;
	NSMutableArray *tagsArray;
	for (CCArray *array in winHexes) 
	{
		count++;
		tagsArray = [[NSMutableArray alloc] init];
		for (Hex *hex in array) 
		{
			[tagsArray addObject:[NSNumber numberWithInt:hex.tag]];
		}
		[tags replaceRow:tagsArray atIndex:count - 1];
		[tagsArray release];
	}
	return tags;
}

@end
