import emojis from '../data/emoji.json';
import { convert } from '../../src';
import { Emoji } from '../data';



describe('object converter', () => {

    it('should work remove all "null"', () => {
        const converted = convert(emojis, {
            filter: {
                value: (key, value) => value !== null,
                recursive: true
            }
        });

        expect(JSON.stringify(converted).match('null')).toBe(null);
        expect(converted).toMatchSnapshot();
    });


    it('should mutate the category to an object with the name and subcategory', () => {
        type ConvertedEmoji = Omit<Emoji, 'category' | 'subcategory'> & {
            category: { name: string; subcategory: string; };
            subcategory: undefined;
        };


        const converted: ConvertedEmoji[] = convert(emojis, {
            mutate: (key, value) => {
                const newValue = {
                    ...value,
                    category: {
                        name: value.category,
                        subcategory: value.subcategory
                    }
                };

                delete newValue.subcategory;
                return newValue;
                // return value;
            }
        });

        for (const [ i, emoji ] of Object.entries(converted)) {
            expect(emoji.subcategory).toBe(undefined);
            expect(emoji.category.name).toBe(emojis[ i ].category);
            expect(emoji.category.subcategory).toBe(emojis[ i ].subcategory);
        }

        expect(converted).toMatchSnapshot();
    });


    it('should mutate the category to an object with the name and subcategory', () => {
        const mutate = (key: null, value: string) => `name ==> ${value}`;

        const converted = convert<Emoji[], Emoji[]>(emojis, {
            filter: {
                value: (key, value) => {
                    if (typeof key === 'number')
                        return key % 2 === 0;

                    return value !== null;
                },
                recursive: true
            },
            next: {
                name: { mutate }
            }
        });


        for (const [ index, emoji ] of Object.entries(converted)) {
            const i = parseInt(index);

            expect(emoji.unified).toBe(emojis[ 2 * i ].unified);
            expect(emoji.name).toBe(mutate(null, emojis[ 2 * i ].name));
        }

        expect(converted.length).toBe(Math.ceil(emojis.length / 2));

        expect(converted).toMatchSnapshot();
    });
});
