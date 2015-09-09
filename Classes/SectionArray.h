//
//  SectionArray.h
//  HexTetris
//
//  Created by Andrey Yastrebov on 10/21/10.
//  Copyright 2010 overboldapps. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface SectionArray : NSObject 
{
	NSMutableArray *sections;
	NSMutableArray *rows;
}

- initWithSections:(NSUInteger)s rows:(NSUInteger)r;
+ sectionArrayWithSections:(NSUInteger)s rows:(NSUInteger)r;
- objectInSection:(NSUInteger)s row:(NSUInteger)r;
- (void)insertObject:o inSection:(NSUInteger)s row:(NSUInteger)r;
- (void)replaceRow:(NSMutableArray *)row atIndex:(NSUInteger)index;
- (NSMutableArray *)getRow:(NSUInteger)row;
- (NSUInteger)sectionsCount;
- (NSUInteger)rowsCount;

@end
