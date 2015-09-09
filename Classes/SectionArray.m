//
//  SectionArray.m
//  HexTetris
//
//  Created by Andrey Yastrebov on 10/21/10.
//  Copyright 2010 overboldapps. All rights reserved.
//

#import "SectionArray.h"

@implementation SectionArray

- initWithSections:(NSUInteger)s rows:(NSUInteger)r 
{
	if ((self = [self init])) 
	{
		sections = [[NSMutableArray alloc] initWithCapacity:s];
		for (int i=0; i<s; i++) 
		{
			rows = [[NSMutableArray alloc] initWithCapacity:r];
			for (int j=0; j<r; j++) 
			{
				[rows insertObject:[NSNull null] atIndex:j];
			}
			[sections addObject:rows];
		}
	}
	return self;
}

+ sectionArrayWithSections:(NSUInteger)s rows:(NSUInteger)r 
{
	return [[[self alloc] initWithSections:s rows:r] autorelease];
}

- objectInSection:(NSUInteger)s row:(NSUInteger)r 
{
	return [[sections objectAtIndex:s] objectAtIndex:r];
}

- (void)insertObject:o inSection:(NSUInteger)s row:(NSUInteger)r 
{
	[[sections objectAtIndex:s] replaceObjectAtIndex:r withObject:o];
}

- (void)replaceRow:(NSMutableArray*)row atIndex:(NSUInteger)index
{
	[sections replaceObjectAtIndex:index withObject:row];
}

- (NSMutableArray*)getRow:(NSUInteger)row
{
	return [sections objectAtIndex:row];
}

- (NSUInteger)sectionsCount
{
	return [sections count];
}

- (NSUInteger)rowsCount
{
	return [rows count];
}

- (void)dealloc
{
	[sections release];
	[rows release];
	[super dealloc];
}

@end
